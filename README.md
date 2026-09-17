# PDF Tools

A client-only PDF/image utility for local use.

## Why v4

- PDF.js is lazy-loaded only on PDF → Images / compression.
- PDF.js uses its bundled Webpack worker instead of a hand-copied public worker.
- `pdfjs-dist` is pinned to 5.7.284.
- No Google Fonts request.
- No `backdrop-filter`, CSS blur filters, or continuous animations.
- Heavy canvas work is bounded.
- Canvases are released after use.
- The browser gets a frame between pages/files.
- PDF.js documents/workers are destroyed after use.

## Install

Delete the old `node_modules` and `.next` once when moving from an older build:

PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules,.next
npm install
npm run dev
```

Open:
http://localhost:3000

## Important

Do not add:
```js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

This version imports:
```js
import("pdfjs-dist/webpack.mjs")
```

The PDF.js Webpack entrypoint is intended to configure the worker automatically.
