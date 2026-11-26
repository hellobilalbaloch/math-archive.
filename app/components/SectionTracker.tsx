"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const jumpTimerRef = useRef<number | null>(null);
  const isJumpingRef = useRef(false);

  const sectionsKey = useMemo(
    () => sections.map((s) => `${s.id}:${s.label}`).join("|"),
    [sections]
  );

  useEffect(() => {
    if (sections.length <= 1) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumpingRef.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const topId = visible[0].target.id;
          setActiveId((prev) => (prev === topId ? prev : topId));
        }
      },
      {
        rootMargin: "-18% 0px -65% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

  useEffect(() => {
    if (!activeId) return;
    const container = scrollContainerRef.current;
    const activePill = pillRefs.current.get(activeId);
    if (!container || !activePill) return;

    // Scroll only the horizontal pill strip—never the outer window
    const targetLeft =
      activePill.offsetLeft -
      container.clientWidth / 2 +
      activePill.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "auto",
    });
  }, [activeId]);

  useEffect(() => {
    return () => {
      if (jumpTimerRef.current !== null) {
        window.clearTimeout(jumpTimerRef.current);
      }
    };
  }, []);

  if (sections.length <= 1) return null;

  function scrollToSection(id: string) {
    setActiveId(id);
    const target = document.getElementById(id);
    if (!target) return;

    isJumpingRef.current = true;
    if (jumpTimerRef.current !== null) {
      window.clearTimeout(jumpTimerRef.current);
    }

    const navbarOffset = 128;
    const y = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - navbarOffset
    );

    window.scrollTo({ top: y, behavior: "smooth" });

    jumpTimerRef.current = window.setTimeout(() => {
      isJumpingRef.current = false;
    }, 650);
  }

  return (
    <div className="sticky top-[61px] z-30 -mx-4 mb-6 border-b border-white/10 bg-[#131212]/90 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
      <div
        ref={scrollContainerRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto"
      >
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
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
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