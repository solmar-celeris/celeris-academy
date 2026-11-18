import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Celeris Academy | Universidade Corporativa",
    template: "%s | Celeris Academy",
  },
  description: "Plataforma interna de aprendizagem e desenvolvimento da SolMar Celeris.",
  applicationName: "Celeris Academy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071b2b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
