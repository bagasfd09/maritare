"use client";

import { motion, useReducedMotion } from "motion/react";
import { templates, type Template } from "./data";

const artStyles: Record<Template["variant"], { bg: string; text: string; sub: string }> = {
  rose: { bg: "linear-gradient(160deg, #f5d6cf 0%, #e2a39b 100%)", text: "#5a1818", sub: "#7c2d2d" },
  cream: { bg: "linear-gradient(160deg, #faf6f1 0%, #ead3c2 100%)", text: "#3a2a1a", sub: "#7c2d2d" },
  sage: { bg: "linear-gradient(160deg, #cdd1b6 0%, #7c7e5e 100%)", text: "#1e2415", sub: "#3a4220" },
  terra: { bg: "linear-gradient(160deg, #e4a481 0%, #b66b4d 100%)", text: "#3a1810", sub: "#5c1f1f" },
};

export function Templates() {
  const reduce = useReducedMotion();

  return (
    <section
      id="template"
      className="relative bg-[var(--color-ivory)] px-6 md:px-14 py-20 md:py-32"
    >
      <motion.div
        initial={reduce ? false : { y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-[1100px] mx-auto mb-20"
      >
        <span className="chip mb-8 inline-flex">Template Pilihan</span>
        <h2
          className="display mt-8 text-[clamp(40px,6vw,80px)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pilih template,
          <br />
          <em>sesuaikan</em> dengan ceritamu.
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {templates.map((t, i) => {
          const style = artStyles[t.variant];
          const offset = i % 2 === 1 ? "md:mt-12" : "";
          return (
            <motion.div
              key={t.name}
              initial={reduce ? false : { y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: i * 0.08 + (i % 2 ? 0.1 : 0),
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group ${offset}`}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]">
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-5"
                  style={{ background: style.bg, color: style.text }}
                >
                  <div
                    className="text-[10px] uppercase tracking-[0.3em] opacity-70"
                    style={{ color: style.sub }}
                  >
                    The Wedding Of
                  </div>
                  <div
                    className="display mt-5 text-4xl md:text-5xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t.couple.left}
                  </div>
                  <div
                    className="italic text-2xl my-2 opacity-70"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    &amp;
                  </div>
                  <div
                    className="display text-4xl md:text-5xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t.couple.right}
                  </div>
                  <div
                    className="mt-6 text-xs tracking-[0.4em] opacity-70"
                    style={{ color: style.sub }}
                  >
                    {t.date}
                  </div>
                </div>

                <div className="absolute inset-x-3 bottom-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <span className="block w-full text-center bg-[var(--color-charcoal)] text-[var(--color-cream)] py-2.5 rounded-full text-xs uppercase tracking-[0.16em]">
                    Pratinjau →
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className="text-lg"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {t.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-ink)]">
                  {t.tag}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
