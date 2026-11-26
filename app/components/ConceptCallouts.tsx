"use client";

import React from "react";
import { MathText } from "@/app/components/MathText";

export type CalloutKind = "definition" | "theorem" | "example";

export interface ParsedSegment {
  type: "text" | "callout";
  content: string;
  kind?: CalloutKind;
  title?: string;
}

const CALLOUT_META: Record<
  CalloutKind,
  {
    badge: string;
    defaultTitle: string;
    borderClass: string;
    surfaceClass: string;
    badgeClass: string;
    labelClass: string;
  }
> = {
  definition: {
    badge: "DEF",
    defaultTitle: "Definition",
    borderClass: "border-sky-400/45",
    surfaceClass: "bg-sky-500/[0.07]",
    badgeClass: "border-sky-400/35 bg-sky-500/15 text-sky-300",
    labelClass: "text-sky-300",
  },
  theorem: {
    badge: "RULE",
    defaultTitle: "Theorem & Rule",
    borderClass: "border-sky-400/35",
    surfaceClass: "bg-sky-400/[0.05]",
    badgeClass: "border-sky-300/30 bg-sky-400/10 text-sky-200",
    labelClass: "text-sky-300",
  },
  example: {
    badge: "WORKED",
    defaultTitle: "Worked Example",
    borderClass: "border-sky-500/30",
    surfaceClass: "bg-black/25",
    badgeClass: "border-sky-400/25 bg-sky-500/10 text-sky-400",
    labelClass: "text-sky-400",
  },
};

function normalizeKind(raw: string): CalloutKind | null {
  const key = raw.trim().toLowerCase();
  if (key === "definition" || key === "def") return "definition";
  if (key === "theorem" || key === "rule" || key === "thm") return "theorem";
  if (key === "example" || key === "worked" || key === "ex") return "example";
  return null;
}

export function parseConceptSegments(rawContent: string): ParsedSegment[] {
  if (!rawContent) return [];

  const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
  const segments: ParsedSegment[] = [];

  let textBuffer: string[] = [];
  let activeKind: CalloutKind | null = null;
  let activeTitle = "";
  let calloutBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      const joined = textBuffer.join("\n").trim();
      if (joined) {
        segments.push({ type: "text", content: joined });
      }
      textBuffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!activeKind) {
      const openMatch = trimmed.match(/^:::([a-zA-Z]+)(?:\s+(.*))?$/);
      if (openMatch) {
        const kind = normalizeKind(openMatch[1]);
        if (kind) {
          flushText();
          activeKind = kind;
          activeTitle = (openMatch[2] ?? "").trim();
          calloutBuffer = [];
          continue;
        }
      }
      textBuffer.push(line);
    } else {
      if (trimmed === ":::") {
        segments.push({
          type: "callout",
          kind: activeKind,
          title: activeTitle || CALLOUT_META[activeKind].defaultTitle,
          content: calloutBuffer.join("\n").trim(),
        });
        activeKind = null;
        activeTitle = "";
        calloutBuffer = [];
      } else {
        calloutBuffer.push(line);
      }
    }
  }

  // Safe fallback if a callout block was never closed with `:::`
  if (activeKind) {
    const fallbackText = [
      `:::${activeKind}${activeTitle ? ` ${activeTitle}` : ""}`,
      ...calloutBuffer,
    ]
      .join("\n")
      .trim();
    if (fallbackText) {
      segments.push({ type: "text", content: fallbackText });
    }
  } else {
    flushText();
  }

  return segments;
}

export function ConceptRichContent({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const segments = parseConceptSegments(content);

  if (segments.length === 0) return null;

  return (
    <div className={`min-w-0 space-y-4 ${className}`}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <div key={`text-${index}`} className="min-w-0">
              <MathText content={segment.content} />
            </div>
          );
        }

        const kind = segment.kind ?? "definition";
        const meta = CALLOUT_META[kind];

        return (
          <aside
            key={`callout-${kind}-${index}`}
            aria-label={`${meta.defaultTitle}: ${segment.title}`}
            className={`min-w-0 overflow-hidden rounded-xl border-l-2 border ${meta.borderClass} ${meta.surfaceClass} p-4 sm:p-5`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider ${meta.badgeClass}`}
              >
                {meta.badge}
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-[0.14em] ${meta.labelClass}`}
              >
                {segment.title || meta.defaultTitle}
              </span>
            </div>

            {segment.content && (
              <div className="mt-3 min-w-0 text-sm leading-relaxed text-zinc-200">
                <MathText content={segment.content} />
              </div>
            )}
          </aside>
        );
      })}
    </div>
  );
}