"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "./icons";

// "Angka Maritare" — a 300vh pinned-scroll ledger that advances through three
// chapters as the user scrolls. This is a faithful port of the design's
// pinnedCounter IIFE: the component renders the static skeleton once and the
// effect drives everything imperatively (count-up, mini-stats, marquee,
// indicator). It never re-renders, so React won't clobber the DOM writes.

type MiniStat = { tag: string; num?: string; numHTML?: string; label: string; spark: number[] };
type State = {
  value: number;
  cls: string;
  chapter: string;
  label: string;
  delta: string;
  deltaTone: string;
  chapterTag: string;
  left: MiniStat;
  right: MiniStat;
  marquee: { v: string; t: string }[];
};

const STATES: State[] = [
  {
    value: 1247, cls: "state-0",
    chapter: "No. 01  /  03",
    label: "Pasangan menggunakan Maritare",
    delta: "+12 hari ini", deltaTone: "",
    chapterTag: "01 / 03 — Komunitas",
    left: { tag: "Jangkauan", num: "147", label: "Kota di seluruh Indonesia & 6 negara diaspora", spark: [30, 55, 42, 70, 60, 85, 78, 100] },
    right: { tag: "Momentum", numHTML: '<em>+</em>38<span style="font-size:0.55em;letter-spacing:0;margin-left:2px">%</span>', label: "Pertumbuhan komunitas tahun ini, dari mulut ke mulut", spark: [25, 32, 40, 38, 55, 62, 88, 100] },
    marquee: [
      { v: "1.247", t: "pasangan terdaftar" },
      { v: "38", t: "provinsi" },
      { v: "147", t: "kota" },
      { v: "+12", t: "pasangan baru hari ini" },
      { v: "21 hari", t: "rata-rata persiapan undangan" },
      { v: "Lombok→Vancouver", t: "pasangan terjauh" },
    ],
  },
  {
    value: 184600, cls: "state-1",
    chapter: "No. 02  /  03",
    label: "Foto & momen tamu diabadikan di galeri pengantin",
    delta: "+842 momen hari ini", deltaTone: "tone-burgundy",
    chapterTag: "02 / 03 — Kenangan",
    left: { tag: "Live Wall", num: "14.230", label: "Jam tayang live wall di TV venue resepsi", spark: [22, 30, 28, 45, 52, 68, 80, 95] },
    right: { tag: "Kecepatan", numHTML: '1<span style="font-size:0.55em;letter-spacing:0;margin-left:2px">,8 dtk</span>', label: "Rata-rata waktu unggah foto sampai tampil di layar", spark: [100, 95, 88, 82, 78, 72, 70, 68] },
    marquee: [
      { v: "184.600", t: "foto & video terunggah" },
      { v: "14.230 jam", t: "tayang live wall" },
      { v: "+842", t: "momen baru hari ini" },
      { v: "0,4 dtk", t: "tercepat tampil di layar" },
      { v: "4K", t: "resolusi maksimum" },
      { v: "99,2%", t: "upload tanpa gagal" },
    ],
  },
  {
    value: 324000, cls: "state-2",
    chapter: "No. 03  /  03",
    label: "Ucapan & doa tamu terkirim",
    delta: "+418 hari ini", deltaTone: "tone-terracotta",
    chapterTag: "03 / 03 — Cerita Tamu",
    left: { tag: "Ragam Suara", num: "62", label: "Bahasa berbeda — dari Sasak sampai Português", spark: [40, 48, 42, 55, 60, 72, 86, 100] },
    right: { tag: "Resonansi", numHTML: '94<span style="font-size:0.55em;letter-spacing:0;margin-left:2px">%</span>', label: "RSVP terjawab dalam 48 jam — tamu yang benar-benar hadir", spark: [55, 60, 68, 72, 80, 88, 92, 100] },
    marquee: [
      { v: "324.000", t: "ucapan & doa terkirim" },
      { v: "62", t: "bahasa berbeda" },
      { v: "+418", t: "ucapan baru hari ini" },
      { v: "2.847", t: "kata — ucapan terpanjang" },
      { v: "3,2", t: "ucapan rata-rata per tamu" },
      { v: "94%", t: "RSVP terjawab" },
    ],
  },
];

export function Counter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const indicatorLabelRef = useRef<HTMLSpanElement>(null);
  const chapterMarkRef = useRef<HTMLDivElement>(null);
  const deltaRef = useRef<HTMLDivElement>(null);
  const deltaTextRef = useRef<HTMLSpanElement>(null);
  const msLeftRef = useRef<HTMLDivElement>(null);
  const msRightRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const numEl = numRef.current;
    const labelEl = labelRef.current;
    const indicatorLabel = indicatorLabelRef.current;
    const chapterMark = chapterMarkRef.current;
    const counterDelta = deltaRef.current;
    const counterDeltaText = deltaTextRef.current;
    const msLeft = msLeftRef.current;
    const msRight = msRightRef.current;
    const marqueeTrack = marqueeRef.current;
    const dots = indicatorRef.current?.querySelectorAll<HTMLElement>(".d-wrap .d");
    if (!wrap || !stage || !numEl || !labelEl || !indicatorLabel || !chapterMark || !counterDelta || !counterDeltaText || !msLeft || !msRight || !marqueeTrack || !dots) return;

    let currentState = -1;
    let animationToken = 0;
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    const format = (n: number) => Math.round(n).toLocaleString("id-ID");

    const countUp = (target: number) => {
      const token = ++animationToken;
      const start = performance.now();
      const dur = 700;
      const step = (now: number) => {
        if (token !== animationToken) return;
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = format(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const renderMiniStat = (el: HTMLElement, data: MiniStat) => {
      const tagEl = el.querySelector(".ms-tag")!;
      const numEl2 = el.querySelector(".ms-num")!;
      const lblEl = el.querySelector(".ms-label")!;
      const sparkEl = el.querySelector(".ms-spark")!;
      const dashFirst = el.classList.contains("right");
      tagEl.innerHTML = dashFirst
        ? `${data.tag}<span class="tdash"></span>`
        : `<span class="tdash"></span>${data.tag}`;
      if (data.numHTML) numEl2.innerHTML = data.numHTML;
      else numEl2.textContent = data.num ?? "";
      lblEl.textContent = data.label;
      const max = Math.max(...data.spark);
      sparkEl.innerHTML = data.spark
        .map((v, i) => {
          const op = i === data.spark.length - 1 ? 1 : i === data.spark.length - 2 ? 0.85 : 0.35;
          return `<i style="height:${(v / max) * 100}%; opacity:${op}"></i>`;
        })
        .join("");
    };

    const renderMarquee = (items: { v: string; t: string }[]) => {
      const html = items
        .map((it) => `<span class="m-item"><b>${it.v}</b>${it.t}</span><span class="m-dot"></span>`)
        .join("");
      marqueeTrack.innerHTML = html + html;
    };

    const setState = (i: number, instant?: boolean) => {
      if (i === currentState) return;
      const prev = currentState;
      currentState = i;
      const s = STATES[i];
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
      animationToken++;
      stage.classList.remove("state-0", "state-1", "state-2");
      stage.classList.add(s.cls);
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      indicatorLabel.textContent = s.chapterTag;
      counterDelta.classList.remove("tone-burgundy", "tone-terracotta");
      if (s.deltaTone) counterDelta.classList.add(s.deltaTone);

      const applyContent = () => {
        labelEl.textContent = s.label;
        chapterMark.textContent = s.chapter;
        counterDeltaText.textContent = s.delta;
        renderMiniStat(msLeft, s.left);
        renderMiniStat(msRight, s.right);
        renderMarquee(s.marquee);
      };

      if (instant || prev === -1) {
        applyContent();
        numEl.textContent = format(s.value);
        for (const el of [numEl, labelEl, chapterMark, counterDelta, msLeft, msRight]) el.style.opacity = "1";
        numEl.style.transform = "translateY(0)";
        return;
      }

      numEl.style.opacity = "0";
      numEl.style.transform = "translateY(-22px)";
      for (const el of [labelEl, chapterMark, counterDelta, msLeft, msRight]) el.style.opacity = "0";
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        applyContent();
        numEl.textContent = format(0);
        numEl.classList.add("no-tr");
        numEl.style.transform = "translateY(22px)";
        void numEl.offsetWidth;
        numEl.classList.remove("no-tr");
        requestAnimationFrame(() => {
          numEl.style.transform = "translateY(0)";
          for (const el of [numEl, labelEl, chapterMark, counterDelta, msLeft, msRight]) el.style.opacity = "1";
          countUp(s.value);
        });
      }, 260);
    };

    const onScroll = () => {
      const r = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      if (r.top > 0) {
        if (currentState !== 0) setState(0, true);
        return;
      }
      if (r.bottom < window.innerHeight) {
        if (currentState !== 2) setState(2, true);
        return;
      }
      const p = Math.max(0, Math.min(0.999, -r.top / total));
      const idx = Math.min(2, Math.floor(p * 3));
      setState(idx);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    setState(0, true);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (pendingTimer) clearTimeout(pendingTimer);
    };
  }, []);

  return (
    <div className="counter-wrap" id="counterWrap" style={{ height: "300vh" }} ref={wrapRef}>
      <div className="counter-pin">
        <div className="counter-stage state-0" ref={stageRef}>
          <svg className="corner-mark tl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"><path d="M3 12V3h9" /></svg>
          <svg className="corner-mark tr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"><path d="M3 12V3h9" /></svg>
          <svg className="corner-mark bl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"><path d="M3 12V3h9" /></svg>
          <svg className="corner-mark br" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square"><path d="M3 12V3h9" /></svg>

          <span className="counter-rail left">Maritare<span className="rdash" />In Numbers<span className="rdash" />Vol. 03</span>
          <span className="counter-rail right">Live Ledger<span className="rdash" />2024 — 2026<span className="rdash" />ID</span>

          <svg className="counter-orn" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.4">
            <circle cx="100" cy="100" r="98" />
            <circle cx="100" cy="100" r="78" />
            <circle cx="100" cy="100" r="58" />
            <circle cx="100" cy="100" r="38" />
          </svg>

          <div className="top">
            <div className="chip">Angka Maritare</div>
            <h2 className="display">Bersama, kami<br /><em>menyusun memori.</em></h2>
            <div className="counter-meta">
              <span className="dot-live" />
              Per 16 Mei 2026 · Diperbarui Real-time
            </div>
          </div>

          <div className="counter-center">
            <div className="mini-stat left" ref={msLeftRef}>
              <div className="ms-tag" />
              <div className="ms-num" />
              <div className="ms-label" />
              <div className="ms-spark" aria-hidden />
            </div>

            <div className="counter-numWrap">
              <div className="chapter-mark" ref={chapterMarkRef}>No. 01 &nbsp;/&nbsp; 03</div>
              <div className="counter-num" ref={numRef}>1.247</div>
              <div className="counter-rule" />
              <div className="counter-label" ref={labelRef}>Pasangan menggunakan Maritare</div>
              <div className="counter-delta" ref={deltaRef}>
                <span className="d-arrow"><ArrowUp size={11} strokeWidth={2.6} /></span>
                <span ref={deltaTextRef}>+12 hari ini</span>
              </div>
            </div>

            <div className="mini-stat right" ref={msRightRef}>
              <div className="ms-tag" />
              <div className="ms-num" />
              <div className="ms-label" />
              <div className="ms-spark" aria-hidden />
            </div>
          </div>

          <div className="counter-bottom">
            <div className="indicator" ref={indicatorRef}>
              <span className="d-wrap">
                <span className="d on" />
                <span className="d" />
                <span className="d" />
              </span>
              <span
                ref={indicatorLabelRef}
                style={{ fontFamily: "var(--body)", fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--text-muted)" }}
              >
                01 / 03 — Komunitas
              </span>
            </div>
            <div className="counter-marquee">
              <div className="marquee-track" ref={marqueeRef} />
            </div>
            <div className="scroll-hint">
              Scroll
              <ArrowDown size={12} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
