import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Celeris Academy | SolMar Celeris",
    template: "%s | Celeris Academy",
  },
  description: "Universidade corporativa da SolMar Celeris: conhecimento, desenvolvimento e evolução contínua.",
  applicationName: "Celeris Academy",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "Celeris Academy | SolMar Celeris",
    description: "Conhecimento que move a SolMar Celeris.",
    siteName: "SolMar Celeris",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#062b4c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
