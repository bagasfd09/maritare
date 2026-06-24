"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { stories } from "./data";

export function StoriesCarousel() {
  const reduce = useReducedMotion();
  const [emblaRef, embla] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    loop: false,
    skipSnaps: false,
    startIndex: 3,
    dragFree: false,
  });
  const [selected, setSelected] = useState(3);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  return (
    <section
      id="cerita"
      className="relative bg-[var(--color-cream)] px-6 md:px-14 py-20 md:py-32 overflow-hidden"
    >
      <motion.div
        initial={reduce ? false : { y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mb-12"
      >
        <span className="chip">Cerita Pengantin</span>
        <h2
          className="display mt-6 text-[clamp(40px,6vw,80px)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Kisah dari mereka
          <br />
          yang sudah <em>bilang &ldquo;iya&rdquo;.</em>
        </h2>
        <a
          href="#"
          className="inline-flex items-center gap-3 mt-6 text-sm tracking-wide hover:opacity-70 transition-opacity"
        >
          See All Stories
          <span className="w-9 h-9 rounded-full border border-[rgba(26,26,26,0.18)] inline-flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </a>
      </motion.div>

      <div className="overflow-hidden -mx-6 md:-mx-14 cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex gap-6 px-6 md:px-14 py-4">
          {stories.map((s, i) => {
            const dist = Math.abs(i - selected);
            const isCenter = i === selected;
            const scale = isCenter ? 1 : dist === 1 ? 0.88 : 0.8;
            const opacity = isCenter ? 1 : dist === 1 ? 0.85 : 0.5;
            const saturate = Math.max(0, 1 - dist * 0.6);

            return (
              <div
                key={i}
                className="shrink-0 transition-[transform,opacity,filter] duration-500 ease-out"
                style={{
                  width: isCenter ? 420 : 340,
                  height: isCenter ? 560 : 480,
                  transform: `scale(${scale})`,
                  opacity,
                  filter: `saturate(${saturate})`,
                }}
              >
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[var(--color-beige)] shadow-[0_24px_60px_-30px_rgba(60,30,10,0.4)]">
                  <Image
                    src={s.image}
                    alt={`${s.couple} — ${s.venue}`}
                    fill
                    sizes="(max-width: 768px) 80vw, 420px"
                    className="object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
                      {s.date}
                    </div>
                    <h4
                      className="display mt-1 text-xl leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {s.couple}
                      <br />
                      <span className="text-base opacity-85 italic">{s.venue}</span>
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <button
          aria-label="Previous"
          onClick={() => embla?.scrollPrev()}
          className="w-11 h-11 rounded-full border border-[rgba(26,26,26,0.18)] inline-flex items-center justify-center hover:bg-[var(--color-charcoal)] hover:text-[var(--color-cream)] hover:border-[var(--color-charcoal)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          aria-label="Next"
          onClick={() => embla?.scrollNext()}
          className="w-11 h-11 rounded-full bg-[var(--color-burgundy)] text-[var(--color-cream)] inline-flex items-center justify-center hover:bg-[var(--color-burgundy-deep)] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
