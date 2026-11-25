// src/components/HeroSection.tsx
import Link from "next/link";
import { AUTHOR_NAME } from "@/app/lib/auth";

export function HeroSection() {
  return (
    <section className="border-b border-white/10 py-16 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
        LEARN DEEP, WILL MEET MATHEMATICS
      </p>
      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
        Mathematical thoughts, derivations, and concepts—collected for curiosity and clarity
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
        Organized systematically by chapter and topic for effortless navigation. Explore freely without requiring a login, or revisit any concept to understand the reasoning and derivation behind each formula.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="#chapters"
          className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-sky-400"
        >
          Explore Chapters
        </Link>
        <Link
          href="#who-is-this-for"
          className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/35 hover:text-white"
        >
          Who Is This For?
        </Link>
      </div>
    </section>
  );
}