## 2026-09-29 — Реестр функций + PDF в Slideover

- **Что**: Nuxt UI каркас (Header + таблица реестра), просмотр PDF на pdfjs-dist в USlideover (страницы, зум, поиск)
- **Зачем**: Демонстрация стокового UI-каркаса реестра с базовым PDF-reader поверх ядра pdf.js
- **Файлы**: `app/`, `mocks/registry-functions.json`, `public/demo.pdf`, `docs/`
- **Mock**: `mocks/registry-functions.json` (реестр функций); PDF — `/demo.pdf`
- **Техдолг / Заметки**: без API/auth; поиск по тексту страниц через getTextContent + TextLayer highlight
- **Блокеры**: —
