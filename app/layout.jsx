import "./globals.css";

export const metadata = {
  title: "PaperFlow",
  description: "Fast local PDF and image tools."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
