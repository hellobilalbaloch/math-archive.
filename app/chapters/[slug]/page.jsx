import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { MathText } from "@/app/components/MathText";
import { SectionTracker } from "@/app/components/SectionTracker";

async function ChapterContent({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (chapterError || !chapter) {
    notFound();
  }

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .eq("chapter_id", chapter.id);

  if (topicsError) {
    console.error("Error fetching topics:", topicsError);
  }

  const topicList = topics ?? [];
  const topicIds = topicList.map((t) => t.id);

  let conceptList = [];
  if (topicIds.length > 0) {
    const { data: concepts, error: conceptsError } = await supabase
      .from("concepts")
      .select("*")
      .in("topic_id", topicIds);

    if (conceptsError) {
      console.error("Error fetching concepts:", conceptsError);
    }

    conceptList = concepts ?? [];
  }

  const conceptsByTopic = new Map();
  for (const concept of conceptList) {
    const existing = conceptsByTopic.get(concept.topic_id) ?? [];
    existing.push(concept);
    conceptsByTopic.set(concept.topic_id, existing);
  }

  const topicSections = topicList.map((topic, idx) => ({
    id: `topic-${topic.id}`,
    label: `${String(idx + 1).padStart(2, "0")}. ${topic.title}`,
  }));

  return (
    <>
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
        <span className="text-zinc-600">/</span>
        <span className="truncate rounded px-1 py-0.5 text-zinc-300">
          {chapter.title}
        </span>
      </nav>

      <header className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-sky-500/[0.06] to-white/[0.02] p-5 sm:mt-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            Chapter
          </span>
          <span className="text-xs text-zinc-400">
            {topicList.length} {topicList.length === 1 ? "Topic" : "Topics"}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
          {chapter.title}
        </h1>

        {chapter.summary && (
          <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {chapter.summary}
          </p>
        )}
      </header>

      {topicSections.length > 1 && (
        <div className="mt-5">
          <SectionTracker sections={topicSections} title="Topics" />
        </div>
      )}

      <div className="mt-6 space-y-6 sm:mt-8">
        {topicList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-8 text-center text-sm text-zinc-400">
            No topics added to this chapter yet.
          </div>
        ) : (
          topicList.map((topic, idx) => {
            const topicConcepts = conceptsByTopic.get(topic.id) ?? [];

            return (
              <section
                key={topic.id}
                id={`topic-${topic.id}`}
                className="min-w-0 scroll-mt-36 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-sky-400">
                    TOPIC {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {topicConcepts.length}{" "}
                    {topicConcepts.length === 1 ? "concept" : "concepts"}
                  </span>
                </div>

                <h2 className="mt-1.5 text-lg font-semibold text-white sm:text-xl">
                  {topic.title}
                </h2>

                {topic.description && (
                  <div className="mt-2.5 min-w-0 text-sm leading-relaxed text-zinc-400">
                    <MathText content={topic.description} />
                  </div>
                )}

                <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                  {topicConcepts.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No concepts in this topic yet.
                    </p>
                  ) : (
                    topicConcepts.map((concept, cIdx) => (
                      <Link
                        key={concept.id}
                        href={`/concepts/${concept.slug}`}
                        className="archive-card group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm text-zinc-200"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="shrink-0 font-mono text-xs text-zinc-500 transition group-hover:text-sky-400">
                            {String(cIdx + 1).padStart(2, "0")}
                          </span>
                          <span className="truncate font-medium text-white transition group-hover:text-sky-300">
                            {concept.title}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-sky-400 transition group-hover:translate-x-0.5">
                          Read →
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}

export default function ChapterPage({ params }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-white sm:px-6 sm:py-12">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />
            <div className="h-60 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />
          </div>
        }
      >
        <ChapterContent params={params} />
      </Suspense>
    </main>
  );
}