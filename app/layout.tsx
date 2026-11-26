import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Navbar } from "@/app/components/Navbar";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
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
    <html lang="en" className={`dark ${openSans.variable}`}>
      <body
        className={`${openSans.className} relative min-h-screen overflow-x-hidden bg-[#131212] text-white antialiased selection:bg-sky-500/30 selection:text-sky-200`}
      >
        {/* Fixed subtle math grid & top blue aura across the whole site */}
        <div
          aria-hidden="true"
          className="math-backdrop pointer-events-none fixed inset-0 -z-10"
        />

        <Navbar />
        <div className="animate-fade-up min-w-0">{children}</div>
      </body>
    </html>
  );
}