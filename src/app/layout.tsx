import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: "#060606",
};

export const metadata: Metadata = {
  title: "School by Dark Phoenix — Interactive Engineering Education",
  description:
    "School by Dark Phoenix — Engineering education platform with DC Circuit Analysis, interactive simulators, and AI tutoring. Learn electronics and electrical engineering online.",
  keywords: [
    "School by Dark Phoenix",
    "Dark Phoenix",
    "engineering education",
    "DC circuit analysis",
    "interactive simulators",
    "AI tutoring",
    "electronics learning",
    "electrical engineering",
    "Project school",
  ],
  authors: [{ name: "Dark Phoenix" }],
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    url: "https://school-by-dark-phoenix.onrender.com",
    title: "School by Dark Phoenix — Interactive Engineering Education",
    description:
      "Learn DC Circuit Analysis, use interactive simulators, and get AI tutoring. A modern engineering education platform by Dark Phoenix.",
    images: ["https://school-by-dark-phoenix.onrender.com/icon-512.png"],
    siteName: "School by Dark Phoenix",
  },
  twitter: {
    card: "summary_large_image",
    title: "School by Dark Phoenix — Interactive Engineering Education",
    description:
      "Learn DC Circuit Analysis, use interactive simulators, and get AI tutoring. A modern engineering education platform by Dark Phoenix.",
    images: ["https://school-by-dark-phoenix.onrender.com/icon-512.png"],
  },
  alternates: {
    canonical: "https://school-by-dark-phoenix.onrender.com",
  },
  verification: {
    google: "11W9N88I8o3Hy-mz0regj1587RhKWdTx6WttPKp7Qio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  headers();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/fallback-loader.css" />
      </head>
      <body className="antialiased">
        {children}
        <div id="fallback-loader">
          <div className="spinner"></div>
          <div>Loading Project school...</div>
        </div>
        <script src="/fallback-loader.js" />
      </body>
    </html>
  );
}
