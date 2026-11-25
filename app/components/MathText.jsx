import katex from "katex";

function renderMathSegment(expr, displayMode, key) {
  try {
    const html = katex.renderToString(expr.trim(), {
      displayMode,
      throwOnError: false,
    });
    return (
      <span
        key={key}
        className={displayMode ? "my-4 block overflow-x-auto py-2" : "inline"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
        {expr}
      </code>
    );
  }
}

function parseMathInline(text, keyPrefix) {
  const parts = text.split(/(\$[^$\n]+?\$)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      return renderMathSegment(part.slice(1, -1), false, `${keyPrefix}-i-${idx}`);
    }
    return <span key={`${keyPrefix}-t-${idx}`}>{part}</span>;
  });
}

export function MathText({ content }) {
  if (!content) return null;

  const blocks = content.split(/(\$\$[\s\S]+?\$\$)/g);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
      {blocks.map((block, idx) => {
        if (block.startsWith("$$") && block.endsWith("$$") && block.length > 4) {
          return renderMathSegment(block.slice(2, -2), true, `b-${idx}`);
        }

        const paragraphs = block.split(/\n\n+/);
        return paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;
          return (
            <p key={`b-${idx}-p-${pIdx}`} className="whitespace-pre-line">
              {parseMathInline(trimmed, `b-${idx}-p-${pIdx}`)}
            </p>
          );
        });
      })}
    </div>
  );
}