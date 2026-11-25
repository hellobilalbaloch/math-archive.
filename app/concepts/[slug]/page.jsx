import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { MathText } from "@/app/components/MathText";

// export const dynamic = "force-dynamic";

export default async function ConceptPage({ params }) {
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
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-white sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="text-sky-400 hover:underline">
          Home
        </Link>
        {chapter && (
          <>
            <span>/</span>
            <Link
              href={`/chapters/${chapter.slug}`}
              className="text-sky-400 hover:underline"
            >
              {chapter.title}
            </Link>
          </>
        )}
        {topic && (
          <>
            <span>/</span>
            <span className="text-zinc-300">{topic.title}</span>
          </>
        )}
      </nav>

      {/* Concept Card */}
      <article className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Concept Note
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          {concept.title}
        </h1>

        {concept.intuition && (
          <section className="mt-6 border-t border-white/10 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Objective
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-zinc-300">
              <MathText content={concept.intuition} />
            </div>
          </section>
        )}

        {concept.explanation && (
          <section className="mt-6 border-t border-white/10 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Explanation
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-zinc-200">
              <MathText content={concept.explanation} />
            </div>
          </section>
        )}

        {concept.key_takeaway && (
          <section className="mt-6 rounded-lg border border-sky-500/30 bg-sky-500/[0.06] p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Key Takeaway
            </h2>
            <div className="mt-1.5 text-sm font-medium text-white">
              <MathText content={concept.key_takeaway} />
            </div>
          </section>
        )}
      </article>
    </main>
  );
}