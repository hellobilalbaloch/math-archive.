"use client";

import React, { useEffect, useState } from "react";

const STORAGE_KEY = "math_archive_reviewed_concepts_v1";

function readReviewedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeReviewedIds(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
}

export function ConceptReadingTracker({ conceptId, slug }) {
  const [progress, setProgress] = useState(0);
  const [reviewed, setReviewed] = useState(false);

  const key = conceptId || slug;

  useEffect(() => {
    if (!key) return;
    const saved = readReviewedIds();
    setReviewed(saved.includes(key));
  }, [key]);

  useEffect(() => {
    function updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(100);
        return;
      }

      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
    }

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  function handleToggleReviewed() {
    if (!key) return;
    const current = readReviewedIds();
    const exists = current.includes(key);
    const next = exists
      ? current.filter((item) => item !== key)
      : [...current, key];

    writeReviewedIds(next);
    setReviewed(!exists);
  }

  return (
    <>
      {/* Fixed Top Reading Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-1 bg-white/[0.06]"
      >
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-sky-300 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(56,189,248,0.65)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mark as Reviewed Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
         
          {/* <span>Read</span> */}
          {reviewed && (
            <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-300">
              Reviewed
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleReviewed}
          aria-pressed={reviewed}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
            reviewed
              ? "border-sky-400/50 bg-sky-500/20 text-sky-200 hover:bg-sky-500/30"
              : "border-white/15 bg-white/[0.04] text-zinc-200 hover:border-sky-400/50 hover:text-white"
          }`}
        >
          <span>{reviewed ? "✓ Marked as Reviewed" : "Mark as Reviewed"}</span>
        </button>
      </div>
    </>
  );
}