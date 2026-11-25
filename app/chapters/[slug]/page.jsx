import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default async function ChapterPage({ params }) {
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

  const { data: topicsData } = await supabase
    .from("topics")
    .select("*")
    .eq("chapter_id", chapter.id)
    .order("sort_order", { ascending: true });

  const topics = topicsData ?? [];
  const topicIds = topics.map((t) => t.id);

  let concepts = [];
  if (topicIds.length > 0) {
    const { data: conceptsData } = await supabase
      .from("concepts")
      .select("*")
      .in("topic_id", topicIds)
      .order("created_at", { ascending: true });
    concepts = conceptsData ?? [];
  }

  const conceptsByTopic = new Map();
  for (const concept of concepts) {
    const list = conceptsByTopic.get(concept.topic_id) ?? [];
    list.push(concept);
    conceptsByTopic.set(concept.topic_id, list);
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-[#131212] px-4 py-12 text-white sm:px-6">
      <Link
        href="/"
        className="text-xs font-medium text-sky-400 transition hover:underline"
      >
        ← Back to Chapters
      </Link>

      <header className="mt-6 border-b border-white/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Chapter
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {chapter.title}
        </h1>
        {chapter.summary && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {chapter.summary}
          </p>
        )}
      </header>

      <div className="mt-10 space-y-10">
        {topics.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-zinc-400">
            No topics added to this chapter yet.
          </div>
        ) : (
          topics.map((topic, tIdx) => {
            const topicConcepts = conceptsByTopic.get(topic.id) ?? [];
            return (
              <section
                key={topic.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-medium text-sky-400">
                      Topic {tIdx + 1}
                    </span>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {topic.title}
                    </h2>
                    {topic.summary && (
                      <p className="mt-1 text-sm text-zinc-400">
                        {topic.summary}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {topicConcepts.length}{" "}
                    {topicConcepts.length === 1 ? "concept" : "concepts"}
                  </span>
                </div>

                {topicConcepts.length === 0 ? (
                  <p className="mt-4 text-xs text-zinc-500">
                    No concepts published under this topic yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-white/10">
                    {topicConcepts.map((concept) => (
                      <li key={concept.id} className="py-3">
                        <Link
                          href={`/concepts/${concept.slug}`}
                          className="group flex items-center justify-between gap-4"
                        >
                          <span className="text-sm font-medium text-zinc-200 transition group-hover:text-sky-400">
                            {concept.title}
                          </span>
                          <span className="text-xs text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-sky-400">
                            Read →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}