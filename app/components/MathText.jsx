import katex from "katex";

function renderMathSegment(expr, displayMode, key) {
  const cleaned = expr.trim();

  try {
    const html = katex.renderToString(cleaned, {
      displayMode,
      throwOnError: false,
    });

    if (displayMode) {
      return (
        <div
          key={key}
          className="my-4 w-full max-w-full overflow-x-auto rounded-lg bg-black/25 px-3 py-2.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <span
        key={key}
        className="inline max-w-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <code
        key={key}
        className="break-all rounded bg-white/10 px-1.5 py-0.5 text-xs text-sky-300"
      >
        {cleaned}
      </code>
    );
  }
}

function parseMathInline(text, keyPrefix) {
  const parts = text.split(/(\$(?:\\\$|[^$\n])+?\$)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const inner = part.slice(1, -1).replace(/\\\$/g, "$");
      return renderMathSegment(inner, false, `${keyPrefix}-i-${idx}`);
    }

    const unescapedText = part.replace(/\\\$/g, "$");
    return <span key={`${keyPrefix}-t-${idx}`}>{unescapedText}</span>;
  });
}

export function MathText({ content }) {
  if (!content) return null;

  const blocks = content.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <div className="min-w-0 space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
      {blocks.map((block, idx) => {
        if (block.startsWith("$$") && block.endsWith("$$") && block.length > 4) {
          return renderMathSegment(block.slice(2, -2), true, `b-${idx}`);
        }

        const paragraphs = block.split(/\n\n+/);
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          return (
            <div
              key={`b-${idx}-p-${pIdx}`}
              className="min-w-0 whitespace-pre-line break-words"
            >
              {parseMathInline(trimmed, `b-${idx}-p-${pIdx}`)}
            </div>
          );
        });
      })}
    </div>
  );
}