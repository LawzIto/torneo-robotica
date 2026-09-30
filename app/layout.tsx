import type { Metadata } from "next";
import { Montserrat, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Las fuentes se cargan una sola vez aquí y quedan disponibles en todo
// el sitio como variables CSS (var(--font-orbitron), etc.). next/font
// las descarga al compilar y las sirve desde el propio dominio, así no
// dependen de Google Fonts ni de qué página se visitó primero.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CIRI 2026 · Certamen Interuniversitario de Robótica e Innovación",
  description:
    "Inscribe a tu equipo en el CIRI 2026: sumo RC, line follower e innovación libre. Reglamento, cronograma y resultados en vivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
