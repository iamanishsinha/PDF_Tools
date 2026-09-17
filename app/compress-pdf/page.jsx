"use client";

import { useEffect, useState } from "react";
import ToolHeader from "../../components/ToolHeader";
import Dropzone from "../../components/Dropzone";
import ProgressButton from "../../components/ProgressButton";
import { compressPdf } from "../../lib/tools";

export default function CompressPdf() {
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  async function run() {
    const file = files[0];
    if (!file || busy) return;
    setBusy(true); setProgress(0); setMessage(""); setResult(null);
    try {
      const out = await compressPdf({ file, level, onProgress: setProgress });
      setResult(out);
      if (out.outputSize >= out.originalSize) setMessage("The original PDF was already smaller, so it was kept.");
    } catch (e) {
      console.error(e);
      setMessage(e?.message || "Could not compress this PDF.");
    } finally { setBusy(false); }
  }

  return (
    <main className="tool-page">
      <ToolHeader index="03" eyebrow="OPTIMIZE / SIZE" title="Compress PDF" description="Reduce file size without sending the document anywhere." />
      <section className="work">
        <Dropzone accept="application/pdf,.pdf" files={files} onFiles={(fs) => { setFiles(fs); setResult(null); setMessage(""); }} />
        {files[0] && (
          <div className="panel">
            <div className="panel-head"><div><span className="label">COMPRESSION</span><h2>Choose a level</h2></div><button className="plain" onClick={() => { setFiles([]); setResult(null); }}>REMOVE</button></div>
            <div className="compression">
              {[
                ["low", "LIGHT", "Structure first", "Preserves the PDF structure where possible."],
                ["medium", "BALANCED", "Balanced", "Best for scans and image-heavy documents."],
                ["high", "SMALL", "Strong", "More aggressive image reduction."]
              ].map(([v, tag, title, desc]) => (
                <button key={v} className={level === v ? "compression-card selected" : "compression-card"} onClick={() => setLevel(v)}>
                  <span>{level === v ? "●" : "○"}</span><small>{tag}</small><strong>{title}</strong><p>{desc}</p>
                </button>
              ))}
            </div>
            <div className="notice">Medium and High rebuild pages as JPEG images. Selectable text may be lost; use Light when preserving document structure matters.</div>
            <ProgressButton busy={busy} progress={progress} label="COMPRESS PDF" onClick={run} />
            {message && <div className="status">{message}</div>}
            {result && (
              <div className="result">
                <div><small>BEFORE</small><strong>{fmt(result.originalSize)}</strong></div>
                <div><small>AFTER</small><strong>{fmt(result.outputSize)}</strong></div>
                <div><small>REDUCED</small><strong>{result.reduction}%</strong></div>
                <a href={result.url} download={result.filename}>DOWNLOAD ↗</a>
              </div>
            )}
          </div>
        )}
      </section>
      <footer className="tool-foot">LOCAL PROCESSING · NO FILE LEAVES THIS DEVICE</footer>
    </main>
  );
}

function fmt(n) { return n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`; }
