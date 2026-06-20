"use client";

import { motion, useReducedMotion } from "motion/react";
import { testimonials } from "./data";

export function Testimonials() {
  const reduce = useReducedMotion();

  return (
    <section className="relative bg-[var(--color-ivory)] px-6 md:px-14 py-20 md:py-32">
      <motion.div
        initial={reduce ? false : { y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-[1100px] mx-auto mb-20"
      >
        <span className="chip mb-8 inline-flex">Dari Mereka</span>
        <h2
          className="display mt-8 text-[clamp(40px,6vw,80px)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Apa kata mereka
          <br />
          yang sudah <em>bilang &ldquo;iya&rdquo;.</em>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={reduce ? false : { y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={reduce ? false : { rotate: -15, opacity: 0 }}
              whileInView={{ rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.2 }}
              className="block text-[120px] leading-none text-[var(--color-terracotta)] -mb-6"
              style={{ fontFamily: "var(--font-display)" }}
              aria-hidden
            >
              &ldquo;
            </motion.span>
            <blockquote
              className="text-[clamp(22px,2.4vw,32px)] italic leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.quote}
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-4">
              <span
                className="w-14 h-14 rounded-full bg-cover bg-center border border-[var(--color-beige)]"
                style={{ backgroundImage: `url(${t.avatar})` }}
                aria-hidden
              />
              <div>
                <div
                  className="text-base"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {t.name}
                </div>
                <div className="text-[12px] uppercase tracking-[0.16em] text-[var(--color-muted-ink)]">
                  {t.city} · {t.month}
                </div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
