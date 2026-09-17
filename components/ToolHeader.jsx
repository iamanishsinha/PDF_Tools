import Link from "next/link";
import Brand from "./Brand";

export default function ToolHeader({ index, eyebrow, title, description }) {
  return (
    <header className="tool-header">
      <div className="tool-nav">
        <Brand />
        <Link href="/" className="back">← Home</Link>
      </div>
      <div className="tool-heading">
        <span className="index">{index}</span>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </header>
  );
}
