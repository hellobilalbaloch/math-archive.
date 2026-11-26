
"use client";

import React from "react";

const CALLOUT_SNIPPETS = [
  {
    id: "definition",
    label: "+ Definition",
    badge: "DEF",
    template: `:::definition Definition Title
State the formal definition clearly.
:::`,
    cursorOffset: 23,
  },
  {
    id: "theorem",
    label: "+ Theorem",
    badge: "RULE",
    template: `:::theorem Rule or Theorem Name
State the formula or rule and any assumptions...
:::`,
    cursorOffset: 19,
  },
  {
    id: "example",
    label: "+ Example",
    badge: "WORKED",
    template: `:::example Example Title
Problem statement and step-by-step solution...
:::`,
    cursorOffset: 19,
  },
  {
    id: "warning",
    label: "+ Warning",
    badge: "TRAP",
    template: `:::warning Common Pitfall
Highlight domain restrictions or sign/algebra traps...
:::`,
    cursorOffset: 19,
  },
];

const MATH_WRAPPERS = [
  {
    id: "inline-math",
    label: "$x$",
    title: "Inline math ($ ... $)",
    prefix: "$",
    suffix: "$",
    placeholder: "x",
  },
  {
    id: "display-math",
    label: "$$x$$",
    title: "Display math ($$ ... $$)",
    prefix: "$$\n",
    suffix: "\n$$",
    placeholder: "x^2 + y^2 = r^2",
  },
  {
    id: "frac",
    label: "\\frac{a}{b}",
    title: "Fraction (\\frac{numerator}{denominator})",
    prefix: "\\frac{",
    suffix: "}{}",
    placeholder: "a",
    selectPlaceholder: true,
  },
  {
    id: "sqrt",
    label: "\\sqrt{x}",
    title: "Square root (\\sqrt{...})",
    prefix: "\\sqrt{",
    suffix: "}",
    placeholder: "x",
  },
  {
    id: "imag-i",
    label: "i",
    title: "Imaginary unit (i)",
    prefix: "i",
    suffix: "",
    placeholder: "",
  },
  {
    id: "theta",
    label: "\\theta",
    title: "Angle theta (\\theta)",
    prefix: "\\theta",
    suffix: "",
    placeholder: "",
  },
];

function applySelectionUpdate(textareaRef: { current: any; }, currentValue: string, onChange: (arg0: any) => void, nextValue: string, selStart: any, selEnd: any) {
  onChange(nextValue);

  requestAnimationFrame(() => {
    const el = textareaRef?.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(selStart, selEnd);
  });
}

export function SnippetToolbar({
  textareaRef,
  value = "",
  onChange,
  className = "",
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const handleInsertCallout = (snippet: { id?: string; label?: string; badge?: string; template: any; cursorOffset: any; }) => {
    if (typeof onChange !== "function") return;

    const el = textareaRef?.current;
    const raw = value ?? "";

    if (!el) {
      const separator = raw.length > 0 && !raw.endsWith("\n") ? "\n\n" : "";
      onChange(`${raw}${separator}${snippet.template}`);
      return;
    }

    const start = el.selectionStart ?? raw.length;
    const end = el.selectionEnd ?? raw.length;

    const before = raw.slice(0, start);
    const after = raw.slice(end);

    const leadingPad =
      before.length === 0
        ? ""
        : before.endsWith("\n\n")
        ? ""
        : before.endsWith("\n")
        ? "\n"
        : "\n\n";

    const trailingPad =
      after.length === 0
        ? ""
        : after.startsWith("\n\n")
        ? ""
        : after.startsWith("\n")
        ? "\n"
        : "\n\n";

    const blockStart = before.length + leadingPad.length;
    const nextValue = `${before}${leadingPad}${snippet.template}${trailingPad}${after}`;
    const caretPos = blockStart + (snippet.cursorOffset ?? 0);

    applySelectionUpdate(textareaRef, raw, onChange, nextValue, caretPos, caretPos);
  };

  const handleInsertMath = (item: { id: string; label: string; title: string; prefix: string; suffix: string; placeholder: string; selectPlaceholder?: undefined; } | { id: string; label: string; title: string; prefix: string; suffix: string; placeholder: string; selectPlaceholder: boolean; }) => {
    if (typeof onChange !== "function") return;

    const el = textareaRef?.current;
    const raw = value ?? "";
    const start = el ? (el.selectionStart ?? raw.length) : raw.length;
    const end = el ? (el.selectionEnd ?? raw.length) : raw.length;

    const before = raw.slice(0, start);
    const selected = raw.slice(start, end);
    const after = raw.slice(end);

    const innerText = selected || item.placeholder;
    const inserted = `${item.prefix}${innerText}${item.suffix}`;
    const nextValue = `${before}${inserted}${after}`;

    let selStart = start + item.prefix.length;
    let selEnd = selStart + innerText.length;

    // For \frac{a}{}, place cursor inside the empty denominator {} if nothing was selected
    if (item.id === "frac" && !selected) {
      selStart = start + item.prefix.length + innerText.length + 2;
      selEnd = selStart;
    } else if (!innerText) {
      selStart = start + inserted.length;
      selEnd = selStart;
    }

    applySelectionUpdate(textareaRef, raw, onChange, nextValue, selStart, selEnd);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Callout Blocks Row */}
      <div
        role="toolbar"
        aria-label="Callout block snippets"
        className="flex flex-wrap items-center gap-1.5"
      >
        {CALLOUT_SNIPPETS.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => handleInsertCallout(snippet)}
            className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/20 hover:text-white active:scale-[0.99]"
          >
            <span className="rounded bg-sky-400/15 px-1 py-0.5 font-mono text-[10px] font-bold text-sky-300">
              {snippet.badge}
            </span>
            <span>{snippet.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Math Wrappers Row */}
      <div
        role="toolbar"
        aria-label="Quick math symbols and wrappers"
        className="flex flex-wrap items-center gap-1.5"
      >
        <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Math:
        </span>
        {MATH_WRAPPERS.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.title}
            onClick={() => handleInsertMath(item)}
            className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-xs text-zinc-200 transition hover:border-sky-400/50 hover:bg-sky-500/10 hover:text-sky-200 active:scale-[0.99]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}