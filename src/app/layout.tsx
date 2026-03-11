import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Seat Checker",
  description:
    "Search seat availability across airlines in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
