import Link from "next/link";
import Brand from "../components/Brand";

const tools = [
  ["01", "IMAGES → PDF", "Build a PDF", "Turn JPG and PNG files into one clean document.", "/image-to-pdf", "↗"],
  ["02", "PDF → IMAGES", "Extract pages", "Export pages as JPG or PNG and get one ZIP.", "/pdf-to-image", "◫"],
  ["03", "COMPRESS PDF", "Make it smaller", "Reduce image-heavy PDF files locally.", "/compress-pdf", "↓"]
];

export default function Home() {
  return (
    <main className="home">
      <div className="shape shape-1" />
      <div className="shape shape-2" />
      <div className="shape shape-3" />
      <header className="home-nav">
        <Brand />
        <span className="privacy-chip"><b /> LOCAL ONLY</span>
      </header>

      <section className="home-hero">
        <div>
          <div className="eyebrow">A SMALL TOOLBOX FOR BIG FILES</div>
          <h1>Make files<br /><em>move.</em></h1>
          <p>Convert and compress documents without uploading them anywhere. Simple tools, direct results.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="paper paper-back">PDF</div>
          <div className="paper paper-front">
            <small>LOCAL FILE</small>
            <strong>READY</strong>
            <span>01 / 03</span>
          </div>
        </div>
      </section>

      <section className="tool-area">
        <div className="tool-area-top"><span>THE TOOLBOX</span><span>NO CLOUD · NO ACCOUNT</span></div>
        <div className="cards">
          {tools.map(([n, kicker, title, text, href, icon], i) => (
            <Link href={href} className={`home-card home-card-${i + 1}`} key={href}>
              <span className="card-no">{n}</span>
              <span className="card-icon">{icon}</span>
              <div className="card-bottom">
                <small>{kicker}</small>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="home-foot">
        <span>FILES STAY ON YOUR DEVICE</span>
        <span>PAPERFLOW / 2026</span>
      </footer>
    </main>
  );
}
