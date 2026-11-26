import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thias Consultancy",
  description: "ServiceNow freelance consultant in België",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
