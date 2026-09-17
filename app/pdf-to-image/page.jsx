"use client";

import { useState } from "react";
import ToolHeader from "../../components/ToolHeader";
import Dropzone from "../../components/Dropzone";
import ProgressButton from "../../components/ProgressButton";
import { renderPdfToImages } from "../../lib/tools";

export default function PdfToImage() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("jpg");
  const [quality, setQuality] = useState(90);
  const [pages, setPages] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const file = files[0];

  async function run() {
    if (!file || busy) return;
    setBusy(true); setProgress(0); setMessage("");
    try {
      const chosen = pages.trim() ? parsePages(pages) : null;
      if (pages.trim() && !chosen.length) throw new Error("Enter pages like 1,3 or 2-6.");
      await renderPdfToImages({ file, format, quality, pages: chosen, onProgress: setProgress });
      setMessage("Images created. Your ZIP download has started.");
    } catch (e) {
      console.error(e);
      setMessage(e?.message || "Could not convert this PDF.");
    } finally { setBusy(false); }
  }

  return (
    <main className="tool-page">
      <ToolHeader index="02" eyebrow="EXTRACT / PAGES" title="PDF → Images" description="Export pages as JPG or PNG in one ZIP." />
      <section className="work">
        <Dropzone accept="application/pdf,.pdf" files={files} onFiles={(fs) => { setFiles(fs); setMessage(""); }} />
        {file && (
          <div className="panel">
            <div className="panel-head"><div><span className="label">OUTPUT</span><h2>{file.name}</h2></div><button className="plain" onClick={() => setFiles([])}>REMOVE</button></div>
            <div className="controls three">
              <label><span>FORMAT</span><select value={format} onChange={(e) => setFormat(e.target.value)}><option value="jpg">JPG</option><option value="png">PNG</option></select></label>
              <label><span>QUALITY <b>{quality}%</b></span><input type="range" min="60" max="100" value={quality} disabled={format === "png"} onChange={(e) => setQuality(e.target.value)} /></label>
              <label><span>PAGES</span><input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="All pages" /></label>
            </div>
            <p className="hint">Examples: <b>1,3,5</b> or <b>2-6</b>. Leave blank for every page.</p>
            <ProgressButton busy={busy} progress={progress} label="EXPORT IMAGES" onClick={run} />
            {message && <div className="status">{message}</div>}
          </div>
        )}
      </section>
      <footer className="tool-foot">LOCAL PROCESSING · ZIP CREATED IN YOUR BROWSER</footer>
    </main>
  );
}

function parsePages(text) {
  const set = new Set();
  for (const part of text.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map(Number);
      if (Number.isInteger(a) && Number.isInteger(b) && a >= 1 && b >= a && b - a <= 1000) {
        for (let i = a; i <= b; i++) set.add(i);
      }
    } else {
      const n = Number(p);
      if (Number.isInteger(n) && n >= 1) set.add(n);
    }
  }
  return [...set].sort((a, b) => a - b);
}
