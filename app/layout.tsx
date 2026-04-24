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
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SolarCalc solar build design platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolarCalc",
    description: "Design accurate grid-tied, off-grid, and hybrid systems.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="SolarCalc" />
        <meta property="og:description" content="Design accurate grid-tied, off-grid, and hybrid systems." />
        <meta property="og:url" content="https://solarcalc.sanchez.ph/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://solarcalc.sanchez.ph/opengraph-image" />
        <meta property="og:site_name" content="SolarCalc" />
        {/* Twitter tags for completeness */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SolarCalc" />
        <meta name="twitter:description" content="Design accurate grid-tied, off-grid, and hybrid systems." />
        <meta name="twitter:image" content="https://solarcalc.sanchez.ph/opengraph-image" />
      </head>
      <body>{children}</body>
    </html>
  );
}