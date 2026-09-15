import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://brick-buddy-ten.vercel.app"),
  title: {
    default: "Brick Buddy | Bring. Build. Bond.",
    template: "%s | Brick Buddy",
  },
  description:
    "Portable screen-free creative play for waiting time, travel, and building together. Brick Buddy Season 2 preorder.",
  applicationName: "Brick Buddy",
  keywords: ["Brick Buddy", "portable creative play", "screen-free kids activity", "building toy", "Philippines"],
  openGraph: {
    type: "website",
    title: "Brick Buddy | Bring. Build. Bond.",
    description: "Small case. Big imagination. Portable creative play made for brighter waiting time.",
    siteName: "Brick Buddy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brick Buddy | Bring. Build. Bond.",
    description: "Portable screen-free creative play for kids and the people who build with them.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
