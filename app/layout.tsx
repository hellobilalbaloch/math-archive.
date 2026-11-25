import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Math Archive",
  description:
    "Mathematical thoughts, derivations, and concepts organized chapter by chapter and topic by topic under the supervision of Bilal Baloch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${openSans.className} min-h-screen bg-[#131212] text-white antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}