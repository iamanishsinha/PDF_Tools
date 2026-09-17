"use client";

export default function FileRows({ files, onRemove, onMove }) {
  return (
    <div className="file-rows">
      {files.map((file, index) => (
        <div className="file-row" key={`${file.name}-${file.lastModified}-${index}`}>
          <span className="row-no">{String(index + 1).padStart(2, "0")}</span>
          <span className="row-kind">{file.type.includes("png") ? "PNG" : "JPG"}</span>
          <span className="row-name" title={file.name}>{file.name}</span>
          <span className="row-size">{size(file.size)}</span>
          <button disabled={index === 0} onClick={() => onMove(index, -1)}>↑</button>
          <button disabled={index === files.length - 1} onClick={() => onMove(index, 1)}>↓</button>
          <button className="remove" onClick={() => onRemove(index)}>×</button>
        </div>
      ))}
    </div>
  );
}

function size(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
