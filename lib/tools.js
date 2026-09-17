import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

let pdfjsPromise;

async function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/webpack.mjs").then((mod) => mod);
  }
  return pdfjsPromise;
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}.`));
    };
    img.src = url;
  });
}

export async function makePdf({ files, pageSize, orientation, marginMm, onProgress }) {
  if (!files.length) throw new Error("No images selected.");
  const margin = Number(marginMm) * 72 / 25.4;
  let pdf = null;

  for (let i = 0; i < files.length; i++) {
    const img = await loadImage(files[i]);
    let [pageW, pageH] = pageSize === "letter" ? [612, 792] : [595.28, 841.89];

    if (pageSize === "original") {
      pageW = img.naturalWidth * 72 / 96;
      pageH = img.naturalHeight * 72 / 96;
    }

    if (orientation === "landscape" && pageH > pageW) [pageW, pageH] = [pageH, pageW];
    if (orientation === "portrait" && pageW > pageH) [pageW, pageH] = [pageH, pageW];

    if (!pdf) {
      pdf = new jsPDF({
        unit: "pt",
        format: [pageW, pageH],
        orientation: pageW > pageH ? "landscape" : "portrait",
        compress: true
      });
    } else {
      pdf.addPage([pageW, pageH], pageW > pageH ? "landscape" : "portrait");
    }

    // Bound raster work so a 20MP phone photo doesn't create a giant canvas.
    const maxPixels = 7_000_000;
    const ratio = Math.min(1, Math.sqrt(maxPixels / (img.naturalWidth * img.naturalHeight)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const maxW = Math.max(1, pageW - margin * 2);
    const maxH = Math.max(1, pageH - margin * 2);
    const fit = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;

    pdf.addImage(canvas.toDataURL("image/jpeg", 0.86), "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h, undefined, "FAST");

    canvas.width = 1;
    canvas.height = 1;
    onProgress?.(Math.round(((i + 1) / files.length) * 100));
    await nextFrame();
  }

  download(pdf.output("blob"), "paperflow-document.pdf");
}

export async function renderPdfToImages({ file, format, quality, pages, onProgress }) {
  const pdfjs = await getPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;

  const chosen = pages?.length
    ? pages.filter((p) => p >= 1 && p <= pdf.numPages)
    : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

  if (!chosen.length) throw new Error("No valid pages selected.");

  const zip = new JSZip();
  const scale = format === "png" ? 1.35 : Math.min(1.7, 1.1 + (Number(quality) - 60) / 70);

  for (let i = 0; i < chosen.length; i++) {
    const page = await pdf.getPage(chosen[i]);
    const initial = page.getViewport({ scale });

    const maxPixels = 12_000_000;
    const pixels = initial.width * initial.height;
    const cap = pixels > maxPixels ? Math.sqrt(maxPixels / pixels) : 1;
    const viewport = cap === 1 ? initial : page.getViewport({ scale: scale * cap });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await canvasBlob(
      canvas,
      format === "png" ? "image/png" : "image/jpeg",
      format === "png" ? undefined : Number(quality) / 100
    );

    zip.file(`page-${String(chosen[i]).padStart(3, "0")}.${format}`, blob);
    canvas.width = 1;
    canvas.height = 1;
    page.cleanup?.();

    onProgress?.(Math.round(((i + 1) / chosen.length) * 85));
    await nextFrame();
  }

  const zipBlob = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 5 } },
    (meta) => onProgress?.(85 + Math.round(meta.percent * 0.15))
  );

  download(zipBlob, `${strip(file.name)}-images.zip`);
  await pdf.destroy();
}

export async function compressPdf({ file, level, onProgress }) {
  const source = await file.arrayBuffer();

  if (level === "low") {
    const doc = await PDFDocument.load(source, { updateMetadata: false, ignoreEncryption: true });
    onProgress?.(30);
    const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
    onProgress?.(100);
    const candidate = new Blob([bytes], { type: "application/pdf" });
    return result(file, candidate.size < file.size ? candidate : new Blob([source], { type: "application/pdf" }));
  }

  const pdfjs = await getPdfJs();
  const loading = pdfjs.getDocument({ data: new Uint8Array(source) });
  const src = await loading.promise;
  const output = await PDFDocument.create();

  const config = level === "high" ? { scale: 0.92, quality: 0.50 } : { scale: 1.15, quality: 0.66 };

  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const viewport = page.getViewport({ scale: config.scale });
    const maxPixels = 9_000_000;
    const pixels = viewport.width * viewport.height;
    const cap = pixels > maxPixels ? Math.sqrt(maxPixels / pixels) : 1;
    const finalViewport = cap === 1 ? viewport : page.getViewport({ scale: config.scale * cap });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(finalViewport.width);
    canvas.height = Math.ceil(finalViewport.height);
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

    await page.render({ canvasContext: ctx, viewport: finalViewport }).promise;
    const blob = await canvasBlob(canvas, "image/jpeg", config.quality);
    const jpg = await output.embedJpg(new Uint8Array(await blob.arrayBuffer()));

    const outPage = output.addPage([viewport.width / config.scale, viewport.height / config.scale]);
    outPage.drawImage(jpg, { x: 0, y: 0, width: outPage.getWidth(), height: outPage.getHeight() });

    canvas.width = 1;
    canvas.height = 1;
    page.cleanup?.();
    onProgress?.(Math.round((i / src.numPages) * 95));
    await nextFrame();
  }

  const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
  const candidate = new Blob([bytes], { type: "application/pdf" });
  await src.destroy();
  onProgress?.(100);
  return result(file, candidate.size < file.size ? candidate : new Blob([source], { type: "application/pdf" }));
}

function result(file, blob) {
  return {
    url: URL.createObjectURL(blob),
    filename: `${strip(file.name)}-compressed.pdf`,
    originalSize: file.size,
    outputSize: blob.size,
    reduction: Math.max(0, (1 - blob.size / file.size) * 100).toFixed(1)
  };
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image encoding failed.")), type, quality);
  });
}

function strip(name) { return name.replace(/\.[^/.]+$/, ""); }

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
