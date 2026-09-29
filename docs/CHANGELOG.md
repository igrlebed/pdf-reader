## 2026-09-29 — CRUD записей технолога + загрузка PDF

- **Что**: Добавление/редактирование записей реестра, загрузка PDF при создании, колонка «Действия» (редактировать / скачать / удалить), поле «Подраздел»
- **Зачем**: Сценарий технолога по ведению материалов с PDF
- **Файлы**: `app/pages/index.vue`, `app/components/RegistryRecordForm.vue`, `app/components/RegistryTable.vue`, `app/types/registry.ts`, `mocks/`
- **Mock**: `mocks/registry-functions.json`, `mocks/registry-catalogs.json`; PDF как blob URL локально
- **Техдолг / Заметки**: без бэкенда; PDF при редактировании не меняется
- **Блокеры**: —

## 2026-09-29 — Реестр функций + PDF в Slideover

- **Что**: Nuxt UI каркас (Header + таблица реестра), просмотр PDF на pdfjs-dist в USlideover (страницы, зум, поиск)
- **Зачем**: Демонстрация стокового UI-каркаса реестра с базовым PDF-reader поверх ядра pdf.js
- **Файлы**: `app/`, `mocks/registry-functions.json`, `public/demo.pdf`, `docs/`
- **Mock**: `mocks/registry-functions.json` (реестр функций); PDF — `/demo.pdf`
- **Техдолг / Заметки**: без API/auth; поиск по тексту страниц через getTextContent + TextLayer highlight
- **Блокеры**: —
