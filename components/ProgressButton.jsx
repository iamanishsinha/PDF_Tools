"use client";

export default function ProgressButton({ busy, progress, label, onClick }) {
  return (
    <button className="process-button" disabled={busy} onClick={onClick}>
      <span>{busy ? `PROCESSING ${progress}%` : label}</span>
      <i>{busy ? "…" : "↗"}</i>
    </button>
  );
}
