"use client";

import { useEffect, useRef, useState } from "react";

export interface TrackerSection {
  id: string;
  label: string;
}

interface SectionTrackerProps {
  sections: TrackerSection[];
  title?: string;
}

export function SectionTracker({ sections, title }: SectionTrackerProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const pillRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (sections.length === 0) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!activeId) return;
    const activePill = pillRefs.current.get(activeId);
    activePill?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  if (sections.length <= 1) return null;

  function scrollToSection(id: string) {
    setActiveId(id);
    const target = document.getElementById(id);
    if (!target) return;

    const navbarOffset = 128;
    const y =
      target.getBoundingClientRect().top + window.scrollY - navbarOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="sticky top-[61px] z-30 -mx-4 mb-6 border-b border-white/10 bg-[#131212]/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {title && (
          <span className="shrink-0 pr-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {title}:
          </span>
        )}

        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              ref={(node) => {
                if (node) pillRefs.current.set(section.id, node);
                else pillRefs.current.delete(section.id);
              }}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_16px_-4px_rgba(56,189,248,0.45)]"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}