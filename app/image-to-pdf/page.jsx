"use client";

import { useState } from "react";
import ToolHeader from "../../components/ToolHeader";
import Dropzone from "../../components/Dropzone";
import FileRows from "../../components/FileRows";
import ProgressButton from "../../components/ProgressButton";
import { makePdf } from "../../lib/tools";

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [margin, setMargin] = useState(10);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  function add(list) {
    const valid = list.filter((f) => ["image/jpeg", "image/png"].includes(f.type));
    setFiles((old) => [...old, ...valid]);
    setMessage("");
  }

  function move(i, d) {
    setFiles((old) => {
      const next = [...old];
      const j = i + d;
      if (j < 0 || j >= next.length) return old;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function run() {
    if (!files.length || busy) return;
    setBusy(true); setProgress(0); setMessage("");
    try {
      await makePdf({ files, pageSize: page, orientation, marginMm: margin, onProgress: setProgress });
      setMessage("PDF created. Your download has started.");
    } catch (e) {
      console.error(e);
      setMessage(e?.message || "Could not create the PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tool-page">
      <ToolHeader index="01" eyebrow="CONVERT / IMAGES" title="Images → PDF" description="Combine JPG and PNG files into one document." />
      <section className="work">
        <Dropzone accept="image/jpeg,image/png" multiple files={files} onFiles={add} />
        {files.length > 0 && (
          <div className="panel">
            <div className="panel-head"><div><span className="label">QUEUE</span><h2>{files.length} image{files.length > 1 ? "s" : ""}</h2></div><button className="plain" onClick={() => setFiles([])}>CLEAR</button></div>
            <FileRows files={files} onRemove={(i) => setFiles((a) => a.filter((_, x) => x !== i))} onMove={move} />
            <div className="controls">
              <label><span>PAGE</span><select value={page} onChange={(e) => setPage(e.target.value)}><option value="a4">A4</option><option value="letter">Letter</option><option value="original">Original</option></select></label>
              <label><span>ORIENTATION</span><select value={orientation} onChange={(e) => setOrientation(e.target.value)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
              <label><span>MARGIN <b>{margin}mm</b></span><input type="range" min="0" max="30" value={margin} onChange={(e) => setMargin(e.target.value)} /></label>
            </div>
            <ProgressButton busy={busy} progress={progress} label="CREATE PDF" onClick={run} />
            {message && <div className="status">{message}</div>}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

function Footer() { return <footer className="tool-foot">LOCAL PROCESSING · NOTHING UPLOADED</footer>; }
