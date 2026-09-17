import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-symbol">P</span>
      <span className="brand-word">PAPER<span>FLOW</span></span>
    </Link>
  );
}
