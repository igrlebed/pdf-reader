import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export interface PdfSearchMatch {
  pageNumber: number
  itemIndex: number
  query: string
}

export function usePdfDocument() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pdfDoc = shallowRef<PDFDocumentProxy | null>(null)
  const pageNumber = ref(1)
  const pageCount = ref(0)
  const scale = ref(1.25)
  const searchQuery = ref('')
  const matches = ref<PdfSearchMatch[]>([])
  const activeMatchIndex = ref(-1)
  const rendering = ref(false)

  let renderTask: { cancel: () => void } | null = null

  async function ensurePdfJs() {
    const pdfjs = await import('pdfjs-dist')
    const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
    return pdfjs
  }

  async function load(url: string) {
    loading.value = true
    error.value = null
    matches.value = []
    activeMatchIndex.value = -1
    searchQuery.value = ''

    try {
      const pdfjs = await ensurePdfJs()
      if (pdfDoc.value && typeof pdfDoc.value.destroy === 'function') {
        try {
          await pdfDoc.value.destroy()
        } catch {
          // ignore
        }
        pdfDoc.value = null
      }
      const doc = await pdfjs.getDocument({ url }).promise
      pdfDoc.value = doc
      pageCount.value = doc.numPages
      pageNumber.value = 1
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить PDF'
      pdfDoc.value = null
      pageCount.value = 0
    } finally {
      loading.value = false
    }
  }

  async function renderPage(
    canvas: HTMLCanvasElement,
    textLayerEl: HTMLElement | null
  ) {
    const doc = pdfDoc.value
    if (!doc || !canvas) return

    rendering.value = true
    try {
      if (renderTask) {
        renderTask.cancel()
        renderTask = null
      }

      const page: PDFPageProxy = await doc.getPage(pageNumber.value)
      const viewport = page.getViewport({ scale: scale.value })
      const outputScale = window.devicePixelRatio || 1

      canvas.width = Math.floor(viewport.width * outputScale)
      canvas.height = Math.floor(viewport.height * outputScale)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`

      const context = canvas.getContext('2d')
      if (!context) return

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0] as const
        : undefined

      const task = page.render({
        canvasContext: context,
        viewport,
        canvas,
        transform: transform ? [...transform] : undefined
      })
      renderTask = task
      await task.promise
      renderTask = null

      if (textLayerEl) {
        textLayerEl.replaceChildren()
        textLayerEl.style.width = `${Math.floor(viewport.width)}px`
        textLayerEl.style.height = `${Math.floor(viewport.height)}px`

        const pdfjs = await ensurePdfJs()
        const textContent = await page.getTextContent()
        const textLayer = new pdfjs.TextLayer({
          textContentSource: textContent,
          container: textLayerEl,
          viewport
        })
        await textLayer.render()
        highlightMatches(textLayerEl)
      }
    } catch (e) {
      if ((e as { name?: string })?.name === 'RenderingCancelledException') return
      error.value = e instanceof Error ? e.message : 'Ошибка отрисовки страницы'
    } finally {
      rendering.value = false
    }
  }

  function highlightMatches(textLayerEl: HTMLElement) {
    const query = searchQuery.value.trim()
    if (!query) return

    const spans = textLayerEl.querySelectorAll('span')
    const lower = query.toLowerCase()
    const active = matches.value[activeMatchIndex.value]

    spans.forEach((span, index) => {
      const text = span.textContent?.toLowerCase() ?? ''
      if (!text.includes(lower)) return
      span.classList.add('pdf-search-hit')
      if (
        active
        && active.pageNumber === pageNumber.value
        && active.itemIndex === index
      ) {
        span.classList.add('pdf-search-hit-active')
        span.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    })
  }

  async function runSearch(query: string) {
    searchQuery.value = query
    matches.value = []
    activeMatchIndex.value = -1

    const doc = pdfDoc.value
    const q = query.trim().toLowerCase()
    if (!doc || !q) return

    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p)
      const content = await page.getTextContent()
      content.items.forEach((item, itemIndex) => {
        const str = 'str' in item ? String(item.str) : ''
        if (str.toLowerCase().includes(q)) {
          matches.value.push({ pageNumber: p, itemIndex, query: q })
        }
      })
    }

    if (matches.value.length) {
      activeMatchIndex.value = 0
      await goToMatch(0)
    }
  }

  async function goToMatch(index: number) {
    if (!matches.value.length) return
    const i = ((index % matches.value.length) + matches.value.length) % matches.value.length
    activeMatchIndex.value = i
    const match = matches.value[i]!
    if (pageNumber.value !== match.pageNumber) {
      pageNumber.value = match.pageNumber
    }
  }

  function nextPage() {
    if (pageNumber.value < pageCount.value) pageNumber.value += 1
  }

  function prevPage() {
    if (pageNumber.value > 1) pageNumber.value -= 1
  }

  function zoomIn() {
    scale.value = Math.min(3, Math.round((scale.value + 0.25) * 100) / 100)
  }

  function zoomOut() {
    scale.value = Math.max(0.5, Math.round((scale.value - 0.25) * 100) / 100)
  }

  function nextMatch() {
    if (!matches.value.length) return
    void goToMatch(activeMatchIndex.value + 1)
  }

  function prevMatch() {
    if (!matches.value.length) return
    void goToMatch(activeMatchIndex.value - 1)
  }

  async function destroy() {
    if (renderTask) {
      renderTask.cancel()
      renderTask = null
    }
    const doc = pdfDoc.value
    pdfDoc.value = null
    if (doc && typeof doc.destroy === 'function') {
      try {
        await doc.destroy()
      } catch {
        // ignore cleanup errors on unmount / HMR
      }
    }
  }

  return {
    loading,
    rendering,
    error,
    pageNumber,
    pageCount,
    scale,
    searchQuery,
    matches,
    activeMatchIndex,
    load,
    renderPage,
    runSearch,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    nextMatch,
    prevMatch,
    destroy
  }
}
