"use client";

import React from "react";
import Link from "next/link";

const CREATE_DRAFT_KEY = "math_archive_studio_create_draft_v1";

export function loadCreateDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CREATE_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCreateDraft(draft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage errors
  }
}

export function clearCreateDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function StatusBannerWithLink({ message, slug }) {
  if (!message) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs text-sky-200">
      <span>{message}</span>
      {slug && (
        <Link
          href={`/concepts/${slug}`}
          className="inline-flex items-center gap-1 rounded border border-sky-400/40 bg-sky-500/15 px-2.5 py-1 font-semibold text-sky-200 transition hover:bg-sky-500/25 hover:text-white"
        >
          <span>Open Live Concept →</span>
        </Link>
      )}
    </div>
  );
}