import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://solarcalc.sanchez.ph"),
  title: "SolarCalc",
  description: "Expert-grade solar sizing and BOM generation",
  openGraph: {
    title: "SolarCalc",
    description: "Design accurate grid-tied, off-grid, and hybrid systems.",
    url: "https://solarcalc.sanchez.ph",
    siteName: "SolarCalc",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}