// src/components/AudienceSection.tsx
export function AudienceSection() {
  return (
    <section id="who-is-this-for" className="border-b border-white/10 py-14">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">
        Who Is This For?
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-base font-semibold text-sky-400">
            For Me Later (My Living Notebook)
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Whenever I work through a problem, spot a pattern, or build intuition around a
            rule—like cyclic powers of $\iota$—I write it down clearly here so I never have to
            reconstruct lost reasoning from scratch.
          </p>
        </div> */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-base font-semibold text-sky-400">
            For Anyone Visiting (Open Access)
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
           The platform provides open access to in-depth mathematical discussions, allowing readers to navigate by chapter and topic and explore detailed explanations, derivations, and underlying mathematical principles without registration or login.
          </p>
        </div>
      </div>
    </section>
  );
}