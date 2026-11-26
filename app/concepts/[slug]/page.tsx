import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { MathText } from "@/app/components/MathText";
import { ConceptRichContent } from "@/app/components/ConceptCallouts";
import { SectionTracker } from "@/app/components/SectionTracker";
import { ConceptReadingTracker } from "@/app/components/ConceptReadingTracker";

async function ConceptContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: concept } = await supabase
    .from("concepts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!concept) {
    notFound();
  }

  let topic = null;
  let chapter = null;
  let prevConcept = null;
  let nextConcept = null;

  if (concept.topic_id) {
    const { data: topicData } = await supabase
      .from("topics")
      .select("id, title, slug, chapter_id")
      .eq("id", concept.topic_id)
      .single();

    topic = topicData ?? null;

    if (topic?.chapter_id) {
      const { data: chapterData } = await supabase
        .from("chapters")
        .select("id, title, slug")
        .eq("id", topic.chapter_id)
        .single();

      chapter = chapterData ?? null;
    }

    const { data: siblingConcepts } = await supabase
      .from("concepts")
      .select("id, title, slug")
      .eq("topic_id", concept.topic_id);

    if (siblingConcepts && siblingConcepts.length > 1) {
      const currentIndex = siblingConcepts.findIndex((c) => c.id === concept.id);
      if (currentIndex > 0) {
        prevConcept = siblingConcepts[currentIndex - 1];
      }
      if (currentIndex >= 0 && currentIndex < siblingConcepts.length - 1) {
        nextConcept = siblingConcepts[currentIndex + 1];
      }
    }
  }

  const availableSections = [
    concept.intuition ? { id: "intuition", label: "01 · Intuition" } : null,
    concept.explanation
      ? { id: "explanation", label: "02 · Explanation" }
      : null,
    concept.key_takeaway
      ? { id: "key-takeaway", label: "03 · Key Takeaway" }
      : null,
  ].filter((item) => item !== null);

  return (
    <>
      {/* Breadcrumb Trail */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400"
      >
        <Link
          href="/"
          className="rounded px-1 py-0.5 text-sky-400 transition hover:bg-sky-500/10 hover:text-sky-300"
        >
          Home
        </Link>
        {chapter && (
          <>
            <span className="text-zinc-600">/</span>
            <Link
              href={`/chapters/${chapter.slug}`}
              className="rounded px-1 py-0.5 text-sky-400 transition hover:bg-sky-500/10 hover:text-sky-300"
            >
              {chapter.title}
            </Link>
          </>
        )}
        {topic && (
          <>
            <span className="text-zinc-600">/</span>
            <span className="truncate rounded px-1 py-0.5 text-zinc-300">
              {topic.title}
            </span>
          </>
        )}
      </nav>

      {/* Sticky Section Jump Strip */}
      <div className="mt-4">
        <SectionTracker sections={availableSections} title="Jump to" />
      </div>

      {/* Reading Progress & Reviewed Toggle */}
      <div className="mt-3">
        <ConceptReadingTracker conceptId={concept.id} slug={concept.slug} />
      </div>

      {/* Main Concept Article */}
      <article className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.85)] sm:mt-6">
        {/* Header Banner */}
        <header className="border-b border-white/10 bg-gradient-to-b from-sky-500/[0.06] to-transparent px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
              Concept Note
            </span>
            {topic && (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-zinc-400">
                {topic.title}
              </span>
            )}
          </div>

          <h1 className="mt-3.5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            {concept.title}
          </h1>
        </header>

        {/* Body Sections */}
        <div className="divide-y divide-white/10 px-5 py-6 sm:px-8 sm:py-8">
          {concept.intuition && (
            <section id="intuition" className="scroll-mt-36 pb-7">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-sky-400">
                  01
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200">
                  Intuition
                </h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="mt-4 rounded-xl border-l-2 border-sky-400/70 bg-black/25 py-3.5 pl-4 pr-3 sm:py-4 sm:pl-5 sm:pr-4">
                <div className="min-w-0 text-zinc-300">
                  <MathText content={concept.intuition} />
                </div>
              </div>
            </section>
          )}

          {concept.explanation && (
            <section
              id="explanation"
              className={`scroll-mt-36 ${
                concept.intuition ? "py-7" : "pb-7"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-sky-400">
                  02
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200">
                  Explanation &amp; Derivation
                </h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="mt-4 min-w-0 text-zinc-200">
                <ConceptRichContent content={concept.explanation} />
              </div>
            </section>
          )}

          {concept.key_takeaway && (
            <section
              id="key-takeaway"
              className={`scroll-mt-36 ${
                concept.intuition || concept.explanation ? "pt-7" : ""
              }`}
            >
              <div className="rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/[0.11] via-sky-500/[0.05] to-transparent p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                    03 · Key Takeaway
                  </h2>
                </div>

                <div className="mt-3 min-w-0 font-medium text-white">
                  <MathText content={concept.key_takeaway} />
                </div>
              </div>
            </section>
          )}
        </div>
      </article>

      {/* Previous / Next Concept Footer */}
      {(prevConcept || nextConcept || chapter) && (
        <nav
          aria-label="Concept Navigation"
          className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2"
        >
          {prevConcept ? (
            <Link
              href={`/concepts/${prevConcept.slug}`}
              className="archive-card group flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 transition group-hover:text-sky-400">
                ← Previous Concept
              </span>
              <span className="mt-1.5 truncate text-sm font-semibold text-white">
                {prevConcept.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextConcept ? (
            <Link
              href={`/concepts/${nextConcept.slug}`}
              className="archive-card group flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 sm:text-right"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 transition group-hover:text-sky-300">
                Next Concept →
              </span>
              <span className="mt-1.5 truncate text-sm font-semibold text-white">
                {nextConcept.title}
              </span>
            </Link>
          ) : chapter ? (
            <Link
              href={`/chapters/${chapter.slug}`}
              className="archive-card group flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 sm:text-right"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 transition group-hover:text-sky-300">
                Back to Chapter →
              </span>
              <span className="mt-1.5 truncate text-sm font-semibold text-white">
                {chapter.title}
              </span>
            </Link>
          ) : null}
        </nav>
      )}
    </>
  );
}

export default function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-white sm:px-6 sm:py-12">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
            <div className="h-9 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />
          </div>
        }
      >
        <ConceptContent params={params} />
      </Suspense>
    </main>
  );
}