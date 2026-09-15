import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Buddy | Bring. Build. Bond.",
  description:
    "Portable creative play made for brighter waiting time, shared adventures, and real connection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
