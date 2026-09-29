# Архитектура

## Стек
- **Framework:** Nuxt 4.5.2
- **Language:** TypeScript
- **UI kit:** Nuxt UI 4.11.2
- **PDF:** pdfjs-dist 6.3.289 (только ядро, без стокового viewer)
- **State:** локальный state в страницах/composables (без Pinia)
- **Docs:** `/docs/` на русском
- **Версии сняты:** `npm view … version` на 2026-09-29

## Структура каталогов

```
app/
  app.vue                 # UApp + Header + UMain
  pages/index.vue         # Реестр функций
  components/
    AppHeader.vue
    RegistryTable.vue
    PdfDocumentSlideover.vue
    pdf/PdfViewer.vue
    pdf/PdfToolbar.vue
  composables/usePdfDocument.ts
  assets/css/main.css
mocks/registry-functions.json
public/demo.pdf
docs/
```

## Маршрутизация
- `/` — реестр функций; клик по строке с PDF открывает `USlideover` с viewer.

## Данные
- Mock JSON в `/mocks/`. Реального API нет.
- PDF демо: `/public/demo.pdf`.

## PDF viewer
- Client-only: `getDocument` → canvas + TextLayer.
- Тулбар: страницы, зум, поиск по тексту документа.
- Worker: `pdfjs-dist/build/pdf.worker.min.mjs` через Vite `?url`.

## UI-каркас
- Только `UHeader` (без сайдбара), под ним таблица реестра.
- Slideover справа, расширенная ширина для чтения PDF.
