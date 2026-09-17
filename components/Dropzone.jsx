"use client";

import { useRef, useState } from "react";

export default function Dropzone({ accept, multiple = false, files, onFiles }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);

  const select = (list) => {
    const chosen = Array.from(list || []);
    if (!chosen.length) return;
    onFiles(multiple ? chosen : chosen.slice(0, 1));
  };

  return (
    <div
      className={`dropzone ${drag ? "dropzone-active" : ""}`}
      onClick={() => ref.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); select(e.dataTransfer.files); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") ref.current?.click();
      }}
    >
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => { select(e.target.files); e.target.value = ""; }}
      />
      <div className="drop-plus">+</div>
      <div className="drop-copy">
        <strong>{files?.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Drop files here"}</strong>
        <span>{files?.length ? "Click to add more" : "or click to browse"}</span>
      </div>
      <div className="drop-meta">{multiple ? "JPG · PNG" : "PDF"} <b>↗</b></div>
    </div>
  );
}
