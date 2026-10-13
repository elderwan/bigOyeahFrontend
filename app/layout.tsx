import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitBooking — Train your way",
  description: "Find a personal trainer and your next session in Chiang Mai."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
