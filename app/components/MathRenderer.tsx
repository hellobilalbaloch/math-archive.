"use client";

import React from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
}

function renderKatexHtml(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return expr;
  }
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  // Split by $$...$$ first, then $...$
  const blockParts = content.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <div className={`space-y-3 leading-relaxed ${className}`}>
      {blockParts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          return (
            <div
              key={i}
              className="my-3 overflow-x-auto rounded border border-white/10 bg-black/40 px-4 py-3 text-white"
              dangerouslySetInnerHTML={{ __html: renderKatexHtml(math, true) }}
            />
          );
        }

        const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
        return (
          <p key={i} className="whitespace-pre-line">
            {inlineParts.map((token, j) => {
              if (token.startsWith("$") && token.endsWith("$")) {
                const math = token.slice(1, -1);
                return (
                  <span
                    key={j}
                    className="text-sky-300"
                    dangerouslySetInnerHTML={{
                      __html: renderKatexHtml(math, false),
                    }}
                  />
                );
              }
              return <React.Fragment key={j}>{token}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}