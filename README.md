# Excalidraw App

A React + Vite app with [@excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) as the core drawing canvas. This is the base setup — more features are planned on top of it.

## What's done so far

- Scaffolded with `npm create vite@latest -- --template react`
- Installed `@excalidraw/excalidraw` and rendered it as a fullscreen canvas in `src/App.jsx`
- Imported Excalidraw's required CSS bundle (`@excalidraw/excalidraw/index.css`)
- Reset `html`, `body`, `#root` margins/padding in `src/index.css` so the canvas fills the whole viewport
- Verified `npm run build` completes successfully with no extra Vite config needed
- Linting is available via `oxlint` (Vite's default), run with `npm run lint`

## Project structure

```
excalidraw-app/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx      # React entry point
    ├── App.jsx       # Renders the Excalidraw canvas
    └── index.css     # Fullscreen layout reset
```

## Planned next steps

- **File uploads**: let users upload files/images into the canvas, likely via `excalidrawAPI.addFiles()` and the `onChange` callback to intercept file data.
- **AI-organized architecture diagrams**: use AI to generate or auto-arrange diagram elements (rectangles, arrows, text) by programmatically driving the Excalidraw scene via `excalidrawAPI`.