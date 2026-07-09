import Link from "next/link";

// Shared layout for the standalone legal/help pages (FAQ, refund, terms).
// Rendered inside the (marketing) layout so it inherits the `.maritare`
// font/token scope. Content-only, no interactivity — server component.
export type Section = { heading: string; body: string | string[] };

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  sections: Section[];
}) {
  return (
    <main
      className="min-h-screen px-6 py-16 md:py-24"
      style={{ background: "var(--bg-cream)", color: "var(--text-charcoal)" }}
    >
      <article className="mx-auto max-w-[720px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm no-underline"
          style={{ color: "var(--text-muted)" }}
        >
          ← Kembali ke beranda
        </Link>

        <div className="mt-10 text-xs uppercase tracking-[0.18em]" style={{ color: "var(--accent-sage)" }}>
          {eyebrow}
        </div>

        <h1
          className="mt-4 text-4xl md:text-5xl leading-[1.05]"
          style={{ fontFamily: "var(--display)", color: "var(--primary-burgundy)" }}
        >
          {title}
        </h1>

        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Terakhir diperbarui {updated}
        </p>

        {intro && (
          <p className="mt-8 text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {intro}
          </p>
        )}

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2
                className="text-xl md:text-2xl"
                style={{ fontFamily: "var(--display)", color: "var(--text-charcoal)" }}
              >
                {s.heading}
              </h2>
              {(Array.isArray(s.body) ? s.body : [s.body]).map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <hr className="my-14" style={{ borderColor: "var(--border-beige)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Ada yang masih ganjal? Email kami di{" "}
          <a href="mailto:support@maritare.id" style={{ color: "var(--primary-burgundy)" }}>
            support@maritare.id
          </a>
          .
        </p>
      </article>
    </main>
  );
}
