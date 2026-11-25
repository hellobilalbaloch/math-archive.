import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { HeroSection } from "@/app/components/HeroSection";
import { AudienceSection } from "@/app/components/AudienceSection";
import type { Chapter, Topic, Concept } from "@/app/types/math";

async function ChaptersSection() {
  const supabase = await createClient();

  const [{ data: chapters }, { data: topics }, { data: concepts }] =
    await Promise.all([
      supabase
        .from("chapters")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("topics").select("id, chapter_id"),
      supabase.from("concepts").select("id, topic_id"),
    ]);

  const chapterList = (chapters ?? []) as Chapter[];
  const topicList = (topics ?? []) as Pick<Topic, "id" | "chapter_id">[];
  const conceptList = (concepts ?? []) as Pick<Concept, "id" | "topic_id">[];

  const topicToChapter = new Map<string, string>();
  const topicCountByChapter = new Map<string, number>();

  for (const t of topicList) {
    topicToChapter.set(t.id, t.chapter_id);
    topicCountByChapter.set(
      t.chapter_id,
      (topicCountByChapter.get(t.chapter_id) ?? 0) + 1
    );
  }

  const conceptCountByChapter = new Map<string, number>();
  for (const c of conceptList) {
    const chapId = topicToChapter.get(c.topic_id);
    if (chapId) {
      conceptCountByChapter.set(
        chapId,
        (conceptCountByChapter.get(chapId) ?? 0) + 1
      );
    }
  }

  return (
    <section id="chapters" className="pt-14">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Chapters
        </h2>
        <span className="text-xs text-zinc-400">
          {chapterList.length}{" "}
          {chapterList.length === 1 ? "chapter" : "chapters"}
        </span>
      </div>

      {chapterList.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">
          No chapters published yet. Sign in to Studio to publish your first
          chapter.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {chapterList.map((chapter, index) => {
            const tCount = topicCountByChapter.get(chapter.id) ?? 0;
            const cCount = conceptCountByChapter.get(chapter.id) ?? 0;

            return (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-sky-400/50 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-sky-400">
                    <span>Chapter {String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sky-400 transition group-hover:translate-x-0.5">
                      Open Chapter →
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-white transition group-hover:text-sky-400">
                    {chapter.title}
                  </h3>

                  {chapter.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {chapter.summary}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4 text-xs text-zinc-400">
                  <span>
                    {tCount} {tCount === 1 ? "Topic" : "Topics"}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span>
                    {cCount} {cCount === 1 ? "Concept" : "Concepts"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ChaptersFallback() {
  return (
    <section id="chapters" className="pt-14">
      <div className="h-7 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-44 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        <div className="h-44 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <HeroSection />
      <AudienceSection />
      <Suspense fallback={<ChaptersFallback />}>
        <ChaptersSection />
      </Suspense>
    </main>
  );
}