import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { MathText } from "@/app/components/MathText";

async function ChapterContent({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!chapter) {
    notFound();
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("sort_order", { ascending: true });

  const topicList = topics ?? [];
  const topicIds = topicList.map((t) => t.id);

  let conceptList = [];
  if (topicIds.length > 0) {
    const { data: concepts } = await supabase
      .from("concepts")
      .select("id, title, slug, topic_id, sort_order")
      .in("topic_id", topicIds)
      .order("sort_order", { ascending: true });

    conceptList = concepts ?? [];
  }

  const conceptsByTopic = new Map();
  for (const concept of conceptList) {
    const existing = conceptsByTopic.get(concept.topic_id) ?? [];
    existing.push(concept);
    conceptsByTopic.set(concept.topic_id, existing);
  }

  return (
    <>
      <nav className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="text-sky-400 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{chapter.title}</span>
      </nav>

      <header className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Chapter
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {chapter.title}
        </h1>
        {chapter.summary && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {chapter.summary}
          </p>
        )}
      </header>

      <div className="mt-8 space-y-6">
        {topicList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">
            No topics added to this chapter yet.
          </div>
        ) : (
          topicList.map((topic, idx) => {
            const topicConcepts = conceptsByTopic.get(topic.id) ?? [];

            return (
              <section
                key={topic.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="text-xs font-medium text-sky-400">
                  Topic {String(idx + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {topic.title}
                </h2>
                {topic.description && (
                  <div className="mt-2 text-sm leading-relaxed text-zinc-400">
                    <MathText content={topic.description} />
                  </div>
                )}

                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {topicConcepts.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No concepts in this topic yet.
                    </p>
                  ) : (
                    topicConcepts.map((concept) => (
                      <Link
                        key={concept.id}
                        href={`/concepts/${concept.slug}`}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200 transition hover:border-sky-400/50 hover:text-sky-400"
                      >
                        <span>{concept.title}</span>
                        <span className="text-xs text-sky-400">Read →</span>
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
    <main className="mx-auto max-w-4xl px-4 py-12 text-white sm:px-6">
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
        }
      >
        <ChapterContent params={params} />
      </Suspense>
    </main>
  );
}