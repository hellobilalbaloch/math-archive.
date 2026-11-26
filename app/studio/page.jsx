"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import { AUTHOR_NAME, isAuthorizedOwner } from "@/app/lib/auth";
import { MathText } from "@/app/components/MathText";
import { SnippetToolbar } from "@/app/components/SnippetToolbar";
import { ConceptRichContent } from "@/app/components/ConceptCallouts";
import {
  clearCreateDraft,
  loadCreateDraft,
  saveCreateDraft,
  StatusBannerWithLink,
} from "@/app/components/StudioDraftBanner";

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function StudioPage() {
  const [supabase] = useState(() => createClient());

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [concepts, setConcepts] = useState([]);

  // Create: Chapter
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterSummary, setChapterSummary] = useState("");
  const [chapterOrder, setChapterOrder] = useState(1);

  // Create: Topic
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicOrder, setTopicOrder] = useState(1);

  // Refs for textareas
  const explanationTextareaRef = useRef(null);
  const editExplanationTextareaRef = useRef(null);
  const draftHydratedRef = useRef(false);

  // Create: Concept
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [conceptTitle, setConceptTitle] = useState("");
  const [conceptIntuition, setConceptIntuition] = useState("");
  const [conceptExplanation, setConceptExplanation] = useState("");
  const [conceptTakeaway, setConceptTakeaway] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

  // Edit state
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterSummary, setEditChapterSummary] = useState("");
  const [editChapterOrder, setEditChapterOrder] = useState(1);

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicChapterId, setEditTopicChapterId] = useState("");
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [editTopicDescription, setEditTopicDescription] = useState("");
  const [editTopicOrder, setEditTopicOrder] = useState(1);

  const [editingConceptId, setEditingConceptId] = useState(null);
  const [editConceptTopicId, setEditConceptTopicId] = useState("");
  const [editConceptTitle, setEditConceptTitle] = useState("");
  const [editConceptIntuition, setEditConceptIntuition] = useState("");
  const [editConceptExplanation, setEditConceptExplanation] = useState("");
  const [editConceptTakeaway, setEditConceptTakeaway] = useState("");

  // Delete confirmation & UI feedback
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [lastSavedSlug, setLastSavedSlug] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadArchiveData() {
    const [{ data: ch }, { data: tp }, { data: cn }] = await Promise.all([
      supabase
        .from("chapters")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("topics")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("concepts")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const nextChapters = ch ?? [];
    const nextTopics = tp ?? [];
    const nextConcepts = cn ?? [];

    setChapters(nextChapters);
    setTopics(nextTopics);
    setConcepts(nextConcepts);

    setChapterOrder(nextChapters.length + 1);
    setTopicOrder(nextTopics.length + 1);

    setSelectedChapterId((prev) =>
      nextChapters.some((c) => c.id === prev) ? prev : nextChapters[0]?.id ?? ""
    );

    const savedDraft = !draftHydratedRef.current ? loadCreateDraft() : null;
    setSelectedTopicId((prev) => {
      if (
        savedDraft?.selectedTopicId &&
        nextTopics.some((t) => t.id === savedDraft.selectedTopicId)
      ) {
        return savedDraft.selectedTopicId;
      }
      return nextTopics.some((t) => t.id === prev) ? prev : nextTopics[0]?.id ?? "";
    });
  }

  useEffect(() => {
    const savedDraft = loadCreateDraft();
    if (savedDraft) {
      const hasContent = Boolean(
        savedDraft.conceptTitle ||
          savedDraft.conceptIntuition ||
          savedDraft.conceptExplanation ||
          savedDraft.conceptTakeaway
      );
      if (hasContent) {
        setConceptTitle(savedDraft.conceptTitle ?? "");
        setConceptIntuition(savedDraft.conceptIntuition ?? "");
        setConceptExplanation(savedDraft.conceptExplanation ?? "");
        setConceptTakeaway(savedDraft.conceptTakeaway ?? "");
        setDraftRestored(true);
      }
    }
    draftHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!draftHydratedRef.current) return;

    const hasContent = Boolean(
      conceptTitle.trim() ||
        conceptIntuition.trim() ||
        conceptExplanation.trim() ||
        conceptTakeaway.trim()
    );

    if (!hasContent) {
      clearCreateDraft();
      setDraftRestored(false);
      return;
    }

    saveCreateDraft({
      selectedTopicId,
      conceptTitle,
      conceptIntuition,
      conceptExplanation,
      conceptTakeaway,
    });
  }, [
    selectedTopicId,
    conceptTitle,
    conceptIntuition,
    conceptExplanation,
    conceptTakeaway,
  ]);

  useEffect(() => {
    let active = true;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        window.location.assign("/login");
        return;
      }

      if (!isAuthorizedOwner(user.email)) {
        window.location.assign("/");
        return;
      }

      setUserEmail(user.email ?? "");
      await loadArchiveData();
      if (active) {
        setCheckingAuth(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [supabase]);

  // --- CREATE HANDLERS ---

  async function handleCreateChapter(e) {
    e.preventDefault();
    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setConfirmDeleteId(null);
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
    if (data?.id) {
      setSelectedChapterId(data.id);
    }
    setStatusMsg("Chapter saved.");
    await loadArchiveData();
  }

  async function handleCreateTopic(e) {
    e.preventDefault();
    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setConfirmDeleteId(null);

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
        description: topicDescription.trim(),
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
    setTopicDescription("");
    if (data?.id) {
      setSelectedTopicId(data.id);
    }
    setStatusMsg("Topic saved.");
    await loadArchiveData();
  }

  async function handleCreateConcept(e) {
    e.preventDefault();
    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setConfirmDeleteId(null);

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
      intuition: conceptIntuition.trim(),
      explanation: conceptExplanation,
      key_takeaway: conceptTakeaway.trim(),
    });

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    clearCreateDraft();
    setDraftRestored(false);
    setConceptTitle("");
    setConceptIntuition("");
    setConceptExplanation("");
    setConceptTakeaway("");
    setLastSavedSlug(slug);
    setStatusMsg("Concept published.");
    await loadArchiveData();
  }

  function handleDiscardDraft() {
    clearCreateDraft();
    setDraftRestored(false);
    setConceptTitle("");
    setConceptIntuition("");
    setConceptExplanation("");
    setConceptTakeaway("");
  }

  // --- EDIT HANDLERS ---

  function startEditChapter(ch) {
    setConfirmDeleteId(null);
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title ?? "");
    setEditChapterSummary(ch.summary ?? "");
    setEditChapterOrder(ch.sort_order ?? 1);
  }

  async function handleUpdateChapter(e) {
    e.preventDefault();
    if (!editingChapterId) return;

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const slug = slugify(editChapterTitle);
    const { error } = await supabase
      .from("chapters")
      .update({
        title: editChapterTitle.trim(),
        slug,
        summary: editChapterSummary.trim(),
        sort_order: Number(editChapterOrder) || 1,
      })
      .eq("id", editingChapterId);

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEditingChapterId(null);
    setStatusMsg("Chapter updated.");
    await loadArchiveData();
  }

  function startEditTopic(tp) {
    setConfirmDeleteId(null);
    setEditingTopicId(tp.id);
    setEditTopicChapterId(tp.chapter_id ?? "");
    setEditTopicTitle(tp.title ?? "");
    setEditTopicDescription(tp.description ?? "");
    setEditTopicOrder(tp.sort_order ?? 1);
  }

  async function handleUpdateTopic(e) {
    e.preventDefault();
    if (!editingTopicId) return;

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const slug = slugify(editTopicTitle);
    const { error } = await supabase
      .from("topics")
      .update({
        chapter_id: editTopicChapterId,
        title: editTopicTitle.trim(),
        slug,
        description: editTopicDescription.trim(),
        sort_order: Number(editTopicOrder) || 1,
      })
      .eq("id", editingTopicId);

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEditingTopicId(null);
    setStatusMsg("Topic updated.");
    await loadArchiveData();
  }

  function startEditConcept(cn) {
    setConfirmDeleteId(null);
    setEditingConceptId(cn.id);
    setEditConceptTopicId(cn.topic_id ?? "");
    setEditConceptTitle(cn.title ?? "");
    setEditConceptIntuition(cn.intuition ?? "");
    setEditConceptExplanation(cn.explanation ?? "");
    setEditConceptTakeaway(cn.key_takeaway ?? "");
  }

  async function handleUpdateConcept(e) {
    e.preventDefault();
    if (!editingConceptId) return;

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const slug = slugify(editConceptTitle);
    const { error } = await supabase
      .from("concepts")
      .update({
        topic_id: editConceptTopicId,
        title: editConceptTitle.trim(),
        slug,
        intuition: editConceptIntuition.trim(),
        explanation: editConceptExplanation,
        key_takeaway: editConceptTakeaway.trim(),
      })
      .eq("id", editingConceptId);

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEditingConceptId(null);
    setLastSavedSlug(slug);
    setStatusMsg("Concept updated.");
    await loadArchiveData();
  }

  // --- DELETE HANDLERS ---

  async function handleDeleteChapter(chapterId) {
    if (confirmDeleteId !== chapterId) {
      setConfirmDeleteId(chapterId);
      return;
    }

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    setBusy(false);
    setConfirmDeleteId(null);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (editingChapterId === chapterId) setEditingChapterId(null);
    if (selectedChapterId === chapterId) setSelectedChapterId("");
    setStatusMsg("Chapter deleted.");
    await loadArchiveData();
  }

  async function handleDeleteTopic(topicId) {
    if (confirmDeleteId !== topicId) {
      setConfirmDeleteId(topicId);
      return;
    }

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);

    setBusy(false);
    setConfirmDeleteId(null);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (editingTopicId === topicId) setEditingTopicId(null);
    if (selectedTopicId === topicId) setSelectedTopicId("");
    setStatusMsg("Topic deleted.");
    await loadArchiveData();
  }

  async function handleDeleteConcept(conceptId) {
    if (confirmDeleteId !== conceptId) {
      setConfirmDeleteId(conceptId);
      return;
    }

    setStatusMsg(null);
    setLastSavedSlug(null);
    setErrorMsg(null);
    setBusy(true);

    const { error } = await supabase
      .from("concepts")
      .delete()
      .eq("id", conceptId);

    setBusy(false);
    setConfirmDeleteId(null);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (editingConceptId === conceptId) setEditingConceptId(null);
    setStatusMsg("Concept deleted.");
    await loadArchiveData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#131212] text-sm text-zinc-400">
        Loading Studio...
      </main>
    );
  }

  const hasDraftContent = Boolean(
    conceptTitle.trim() ||
      conceptIntuition.trim() ||
      conceptExplanation.trim() ||
      conceptTakeaway.trim()
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-[#131212] px-4 py-10 text-white sm:px-6">
      {/* Header */}
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

      {/* Status & Error Banners */}
      <StatusBannerWithLink message={statusMsg} slug={lastSavedSlug} />

      {errorMsg && (
        <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Active Edit Panels */}
      {editingChapterId && (
        <form
          onSubmit={handleUpdateChapter}
          className="mt-8 space-y-4 rounded-xl border border-sky-500/40 bg-sky-500/[0.04] p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Edit Chapter</h2>
            <button
              type="button"
              onClick={() => setEditingChapterId(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-400">Title</label>
              <input
                type="text"
                required
                value={editChapterTitle}
                onChange={(e) => setEditChapterTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400">Sort Order</label>
              <input
                type="number"
                value={editChapterOrder}
                onChange={(e) => setEditChapterOrder(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Summary</label>
            <textarea
              rows={2}
              required
              value={editChapterSummary}
              onChange={(e) => setEditChapterSummary(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Update Chapter
          </button>
        </form>
      )}

      {editingTopicId && (
        <form
          onSubmit={handleUpdateTopic}
          className="mt-8 space-y-4 rounded-xl border border-sky-500/40 bg-sky-500/[0.04] p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Edit Topic</h2>
            <button
              type="button"
              onClick={() => setEditingTopicId(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-zinc-400">Chapter</label>
              <select
                value={editTopicChapterId}
                onChange={(e) => setEditTopicChapterId(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              >
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
                value={editTopicTitle}
                onChange={(e) => setEditTopicTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400">Sort Order</label>
              <input
                type="number"
                value={editTopicOrder}
                onChange={(e) => setEditTopicOrder(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Description</label>
            <textarea
              rows={2}
              required
              value={editTopicDescription}
              onChange={(e) => setEditTopicDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Update Topic
          </button>
        </form>
      )}

      {editingConceptId && (
        <form
          onSubmit={handleUpdateConcept}
          className="mt-8 space-y-4 rounded-xl border border-sky-500/40 bg-sky-500/[0.04] p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Edit Concept</h2>
            <button
              type="button"
              onClick={() => setEditingConceptId(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-400">Topic</label>
              <select
                value={editConceptTopicId}
                onChange={(e) => setEditConceptTopicId(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              >
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
                value={editConceptTitle}
                onChange={(e) => setEditConceptTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Intuition</label>
            <textarea
              rows={2}
              required
              value={editConceptIntuition}
              onChange={(e) => setEditConceptIntuition(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400">
              Explanation &amp; LaTeX
            </label>
            <SnippetToolbar
              textareaRef={editExplanationTextareaRef}
              value={editConceptExplanation}
              onChange={setEditConceptExplanation}
              className="mt-2 mb-2"
            />
            <textarea
              ref={editExplanationTextareaRef}
              rows={6}
              required
              value={editConceptExplanation}
              onChange={(e) => setEditConceptExplanation(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 font-mono text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Key Takeaway</label>
            <input
              type="text"
              required
              value={editConceptTakeaway}
              onChange={(e) => setEditConceptTakeaway(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="rounded-lg border border-white/10 bg-[#131212] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              Live KaTeX Preview (Edit)
            </p>
            <ConceptRichContent content={editConceptExplanation} />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Update Concept
          </button>
        </form>
      )}

      {/* Create: Chapter & Topic Forms */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
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
              placeholder="Complex Numbers"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Summary</label>
            <textarea
              rows={2}
              required
              value={chapterSummary}
              onChange={(e) => setChapterSummary(e.target.value)}
              placeholder="Algebraic form, geometry in the plane, and polar roots."
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
              placeholder="Polar Form & De Moivre's Theorem"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400">Description</label>
            <textarea
              rows={2}
              required
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              placeholder="Representing complex numbers via modulus and argument."
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

      {/* Create: Concept Form & Live KaTeX Preview */}
      <form
        onSubmit={handleCreateConcept}
        className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">
            New Math Concept (KaTeX)
          </h2>
          {hasDraftContent && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">
              {draftRestored ? "Draft Restored" : "Auto-Saved to Browser"}
            </span>
          )}
        </div>

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
              placeholder="Multiplying Complex Numbers in Polar Form"
              className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400">Intuition</label>
          <textarea
            rows={2}
            required
            value={conceptIntuition}
            onChange={(e) => setConceptIntuition(e.target.value)}
            placeholder="Why this identity or theorem works geometrically or algebraically."
            className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400">
            Explanation &amp; LaTeX (use $...$ for inline, $$...$$ for display
            math)
          </label>
          <SnippetToolbar
            textareaRef={explanationTextareaRef}
            value={conceptExplanation}
            onChange={setConceptExplanation}
            className="mt-2 mb-2"
          />
          <textarea
            ref={explanationTextareaRef}
            rows={8}
            required
            value={conceptExplanation}
            onChange={(e) => setConceptExplanation(e.target.value)}
            placeholder={
              "Let $z_1 = r_1(\\cos\\theta_1 + i\\sin\\theta_1)$ and $z_2 = r_2(\\cos\\theta_2 + i\\sin\\theta_2)$.\n\n$$z_1 z_2 = r_1 r_2 \\bigl(\\cos(\\theta_1 + \\theta_2) + i\\sin(\\theta_1 + \\theta_2)\\bigr)$$"
            }
            className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 font-mono text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400">Key Takeaway</label>
          <input
            type="text"
            required
            value={conceptTakeaway}
            onChange={(e) => setConceptTakeaway(e.target.value)}
            placeholder="Short revision rule for later."
            className="mt-1 w-full rounded-md border border-white/15 bg-[#131212] px-3 py-2 text-sm text-white"
          />
        </div>

        <div className="space-y-4 rounded-lg border border-white/10 bg-[#131212] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Live KaTeX Preview
          </p>
          {conceptIntuition && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-400">
                Intuition
              </p>
              <MathText content={conceptIntuition} />
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Explanation
            </p>
            <ConceptRichContent content={conceptExplanation} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-sky-400 disabled:opacity-60"
          >
            Publish Concept
          </button>

          {hasDraftContent && (
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="rounded-md border border-white/15 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-400/40 hover:text-red-300"
            >
              Discard Draft
            </button>
          )}
        </div>
      </form>

      {/* Published Items Lists with View, Edit & Delete Actions */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Chapters */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">
            Published Chapters ({chapters.length})
          </h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {chapters.length === 0 ? (
              <li className="py-2.5 text-xs text-zinc-500">No chapters yet.</li>
            ) : (
              chapters.map((ch) => {
                const isConfirming = confirmDeleteId === ch.id;
                return (
                  <li
                    key={ch.id}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <span className="truncate text-zinc-200">{ch.title}</span>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <Link
                        href={`/chapters/${ch.slug}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEditChapter(ch)}
                        className="text-xs text-zinc-300 transition hover:text-sky-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteChapter(ch.id)}
                        className={`text-xs font-medium transition ${
                          isConfirming
                            ? "text-red-400 underline"
                            : "text-zinc-400 hover:text-red-400"
                        }`}
                      >
                        {isConfirming ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Topics */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">
            Published Topics ({topics.length})
          </h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {topics.length === 0 ? (
              <li className="py-2.5 text-xs text-zinc-500">No topics yet.</li>
            ) : (
              topics.map((tp) => {
                const isConfirming = confirmDeleteId === tp.id;
                return (
                  <li
                    key={tp.id}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <span className="truncate text-zinc-200">{tp.title}</span>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEditTopic(tp)}
                        className="text-xs text-zinc-300 transition hover:text-sky-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteTopic(tp.id)}
                        className={`text-xs font-medium transition ${
                          isConfirming
                            ? "text-red-400 underline"
                            : "text-zinc-400 hover:text-red-400"
                        }`}
                      >
                        {isConfirming ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Concepts */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">
            Published Concepts ({concepts.length})
          </h2>
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {concepts.length === 0 ? (
              <li className="py-2.5 text-xs text-zinc-500">No concepts yet.</li>
            ) : (
              concepts.map((cn) => {
                const isConfirming = confirmDeleteId === cn.id;
                return (
                  <li
                    key={cn.id}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <span className="truncate text-zinc-200">{cn.title}</span>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <Link
                        href={`/concepts/${cn.slug}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => startEditConcept(cn)}
                        className="text-xs text-zinc-300 transition hover:text-sky-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDeleteConcept(cn.id)}
                        className={`text-xs font-medium transition ${
                          isConfirming
                            ? "text-red-400 underline"
                            : "text-zinc-400 hover:text-red-400"
                        }`}
                      >
                        {isConfirming ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}