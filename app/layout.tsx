import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  title: "Arc Raiders: Mankind Rises — Fan Series | Coming Soon",
  description:
    "Earth, 2180. The machines came from above. Humanity went below. Now we rise. A fan-made series set in the universe of ARC Raiders by Embark Studios.",
  keywords: [
    "Arc Raiders",
    "Mankind Rises",
    "ARC Raiders fan series",
    "fan film",
    "fan made",
    "Embark Studios",
    "post-apocalyptic series",
    "sci-fi fan series",
    "arc raiders 2180",
  ],
  openGraph: {
    title: "Arc Raiders: Mankind Rises — Fan Series",
    description:
      "Earth, 2180. The machines came from above. Humanity went below. Now we rise. A fan-made series set in the universe of ARC Raiders.",
    type: "website",
    url: "https://www.arcraiders-mankindrises.com",
    siteName: "Arc Raiders: Mankind Rises",
    images: [
      {
        url: "/og-image.png",
        width: 1512,
        height: 756,
        alt: "Arc Raiders: Mankind Rises — A Fan-Made Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arc Raiders: Mankind Rises — Fan Series",
    description:
      "Earth, 2180. The machines came from above. Humanity went below. Now we rise.",
    images: ["/og-image.png"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Stick+No+Bills:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
