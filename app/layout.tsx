import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  title: "Arc Raiders: Mankind Rises — Coming Soon",
  description:
    "Une série fan post-apocalyptique inspirée du jeu ARC Raiders d'Embark Studios. Earth, 2180. The machines came from above. Humanity went below. Now we rise.",
  openGraph: {
    title: "Arc Raiders: Mankind Rises",
    description: "Fan series — Coming Soon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
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
