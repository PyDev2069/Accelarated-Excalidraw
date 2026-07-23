# Excalidraw App

A React + Vite app with [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) as the core drawing canvas, extended with a board management dashboard, auto-save, and a per-element code snippet sidebar.

## Project structure

```
src/
├── App.jsx                        # Route table (react-router-dom)
├── main.jsx                       # React entry point
├── styles/
│   └── index.css                  # Global reset
├── utils/
│   └── boardStorage.js            # All localStorage logic (boards + snippets)
├── components/
│   └── CodeSidebar.jsx            # Resizable per-element code snippet panel
└── pages/
    ├── HomePage.jsx               # Landing / marketing page
    ├── DashboardPage.jsx          # Board list (create, open, rename, delete)
    ├── WhiteboardPage.jsx         # Fullscreen Excalidraw canvas
    └── components/                # Homepage sub-components
        ├── Hero.jsx
        ├── Navbar.jsx
        ├── Features.jsx
        ├── TechStack.jsx
        ├── LiveDemo.jsx
        └── Footer.jsx
```

## User flow

```
Home (/)  →  Dashboard (/dashboard)  →  Board (/board/:boardId)
```

## What's been built

### Routing
- `react-router-dom` with three routes: `/`, `/dashboard`, `/board/:boardId`
- Each page owns its full screen — no shared persistent layout

### Board dashboard (`/dashboard`)
- Lists all saved boards sorted by last modified
- Create new board, open existing, rename (inline double-click or ✏️ button), delete
- Empty state when no boards exist yet

### Auto-save
- Every board is saved to `localStorage` automatically while you draw
- Debounced 1 second after the last change so it never stutters
- Only safe `appState` fields are persisted (scroll, zoom, background) — the full object contains non-serialisable values that corrupt on reload
- Deleted elements are filtered out before saving to keep storage lean

### Board persistence (`boardStorage.js`)
- Single source of truth for all `localStorage` operations
- Three storage keys: `boards:index` (metadata list), `boards:data:<id>` (canvas), `boards:snippets:<id>` (code snippets)
- Swap to IndexedDB or a backend API by changing only this file

### Code snippet sidebar (`CodeSidebar.jsx`)
- Opens automatically when a single drawable element is selected
- Supported element types: `rectangle`, `ellipse`, `diamond`, `arrow`, `line`, `freedraw`, `text`
- Excluded types: `image`, `frame`, `embeddable` (intentional)
- Six languages supported: Python, JavaScript, Java, C++, C, SQL
- Each language has its own independent snippet per element — switching language tabs loads that language's saved code without touching the others
- Tab indicators show a dot when a language has saved code
- Clear button removes only the current language's snippet
- Sidebar is drag-resizable (200px – 600px) via a handle on the left edge

### Whiteboard page (`WhiteboardPage.jsx`)
- Loads saved board data before mounting Excalidraw (guards with a `ready` flag to prevent blank canvas on new boards)
- Board name shown in top bar — double-click or ✏️ to rename inline
- Live "Saving… / ✓ Saved" indicator
- ← Boards button returns to dashboard

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a real browser tab — **not** VSCode's built-in preview, as localStorage does not persist reliably there.

## Other commands

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint      # run oxlint
```

## Planned next steps

- **File uploads**: let users upload files into the canvas via `excalidrawAPI.addFiles()` and intercept binary data in the `onChange` callback
- **AI-organised architecture diagrams**: generate or auto-arrange diagram elements (rectangles, arrows, text) by programmatically driving the Excalidraw scene via `excalidrawAPI`
