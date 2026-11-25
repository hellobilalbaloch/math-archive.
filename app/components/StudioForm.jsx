"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { AUTHOR_NAME } from "@/app/lib/auth";
import { MathText } from "@/app/components/MathText";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StudioForm({
  initialChapters = [],
  initialTopics = [],
  initialConcepts = [],
  userEmail,
}) {
  const supabase = createClient();

  const [chapters, setChapters] = useState(initialChapters);
  const [topics, setTopics] = useState(initialTopics);
  const [concepts, setConcepts] = useState(initialConcepts);

  // Chapter form state
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterSummary, setChapterSummary] = useState("");
  const [chapterOrder, setChapterOrder] = useState(initialChapters.length + 1);

  // Topic form state
  const [selectedChapterId, setSelectedChapterId] = useState(
    initialChapters[0]?.id ?? ""
  );
  const [topicTitle, setTopicTitle] = useState("");
  const [topicSummary, setTopicSummary] = useState("");
  const [topicOrder, setTopicOrder] = useState(initialTopics.length + 1);

  // Concept form state
  const [selectedTopicId, setSelectedTopicId] = useState(
    initialTopics[0]?.id ?? ""
  );
  const [conceptTitle, setConceptTitle] = useState("");
  const [conceptContent, setConceptContent] = useState("");

  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refreshAll() {
    const [{ data: ch }, { data: tp }, { data: cn }] = await Promise.all([
      supabase.from("chapters").select("*").order("sort_order", { ascending: true }),
      supabase.from("topics").select("*").order("sort_order", { ascending: true }),
      supabase.from("concepts").select("*").order("created_at", { ascending: false }),
    ]);
    const nextChapters = ch ?? [];
    const nextTopics = tp ?? [];
    setChapters(nextChapters);
    setTopics(nextTopics);
    setConcepts(cn ?? []);

    if (!selectedChapterId && nextChapters[0]?.id) {
      setSelectedChapterId(nextChapters[0].id);
    }
    if (!selectedTopicId && nextTopics[0]?.id) {
      setSelectedTopicId(nextTopics[0].id);
    }
  }

  async function handleCreateChapter(e) {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    setBusy(true);

    const slug = slugify(chapterTitle);
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        title: chapterTitle.trim(),
        slug,
        summary: chapterSummary.trim(),
        sort_order: Number(chapterOrder) || 1,
      })
      .select()
      .single();

    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setChapterTitle("");
    setChapterSummary("");
    setChapterOrder(chapters.length + 2);
    if (data?.id) setSelectedChapterId(data.id);
    setStatusMsg("Chapter created.");
    await refreshAll();
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    if (!selectedChapterId) {
      setErrorMsg("Create or select a chapter first.");
      return;
    }

    setBusy(true);
    const slug = slugify(topicTitle);
    const { data, error } = await supabase
      .from("topics")
      .insert({
        chapter_id: selectedChapterId,
        title: topicTitle.trim(),
        slug,
        summary: topicSummary.trim(),
        sort_order: Number(topicOrder) || 1,
      })
      .select()
      .single();

    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setTopicTitle("");
    setTopicSummary("");
    setTopicOrder(topics.length + 2);
    if (data?.id) setSelectedTopicId(data.id);
    setStatusMsg("Topic created.");
    await refreshAll();
  }

  async function handleCreateConcept(e) {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);

    if (!selectedTopicId) {
      setErrorMsg("Create or select a topic first.");
      return;
    }

    setBusy(true);
    const slug = slugify(conceptTitle);
    const { error } = await supabase.from("concepts").insert({
      topic_id: selectedTopicId,
      title: conceptTitle.trim(),
      slug,
      content: conceptContent,
    });

    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setConceptTitle("");
    setConceptContent("");
    setStatusMsg("Concept published.");
    await refreshAll();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-[#131212] px-4 py-10 text-white sm:px-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Author Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {AUTHOR_NAME}&apos;s Math Archive
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Signed in as {userEmail} • `/` redirects here while logged in
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-sky-400 hover:text-white"
        >
          Sign Out
        </button>
      </div>

      {/* Feedback Banners */}
      {statusMsg && (
        <div className="mt-6 rounded-md border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs text-sky-200">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Creation Forms */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* New Chapter */}
        <form
          onSubmit={handleCreateChapter}
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h2 className="text-lg font-semibold text-white">New Chapter</h2>
          <div>
            <label className="block text-xs text-zinc-400">Title</label>
            <input
              type="text"
              required
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Limits and Continuity"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Summary</label>
            <textarea
              rows={2}
              value={chapterSummary}
              onChange={(e) => setChapterSummary(e.target.value)}
              placeholder="Foundational limits, one-sided behavior, and continuity."
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Sort Order</label>
            <input
              type="number"
              value={chapterOrder}
              onChange={(e) => setChapterOrder(e.target.value)}
              className="mt-1 w-28 rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Save Chapter
          </button>
        </form>

        {/* New Topic */}
        <form
          onSubmit={handleCreateTopic}
          className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h2 className="text-lg font-semibold text-white">New Topic</h2>
          <div>
            <label className="block text-xs text-zinc-400">Chapter</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            >
              {chapters.length === 0 && (
                <option value="">No chapters yet</option>
              )}
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Topic Title</label>
            <input
              type="text"
              required
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="Squeeze Theorem"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Summary</label>
            <textarea
              rows={2}
              value={topicSummary}
              onChange={(e) => setTopicSummary(e.target.value)}
              placeholder="Bounding a function between two functions with equal limits."
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400">Sort Order</label>
            <input
              type="number"
              value={topicOrder}
              onChange={(e) => setTopicOrder(e.target.value)}
              className="mt-1 w-28 rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Save Topic
          </button>
        </form>
      </div>

      {/* New Concept + Live KaTeX Preview */}
      <form
        onSubmit={handleCreateConcept}
        className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-6"
      >
        <h2 className="text-lg font-semibold text-white">
          New Math Concept (KaTeX)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-zinc-400">Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            >
              {topics.length === 0 && (
                <option value="">No topics yet</option>
              )}
              {topics.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Concept Title</label>
            <input
              type="text"
              required
              value={conceptTitle}
              onChange={(e) => setConceptTitle(e.target.value)}
              placeholder="Limit of sin(x)/x as x approaches 0"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400">
            Notes &amp; LaTeX (use $...$ for inline, $$...$$ for display math)
          </label>
          <textarea
            rows={6}
            required
            value={conceptContent}
            onChange={(e) => setConceptContent(e.target.value)}
            placeholder={"For small angles, $\\sin x \\approx x$.\n\n$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$"}
            className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 font-mono text-sm text-white"
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-[#131212] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            Live KaTeX Preview
          </p>
          <MathText content={conceptContent} />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
        >
          Publish Concept
        </button>
      </form>

      {/* Published Archive Links */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">
            Published Chapters ({chapters.length})
          </h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {chapters.map((ch) => (
              <li
                key={ch.id}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="text-zinc-200">{ch.title}</span>
                <Link
                  href={`/chapters/${ch.slug}`}
                  className="text-xs text-sky-400 hover:underline"
                >
                  View Chapter →
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">
            Published Concepts ({concepts.length})
          </h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {concepts.map((cn) => (
              <li
                key={cn.id}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="text-zinc-200">{cn.title}</span>
                <Link
                  href={`/concepts/${cn.slug}`}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Open Concept →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}