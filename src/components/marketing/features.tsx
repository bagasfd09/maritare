"use client";

/* eslint-disable @next/next/no-img-element -- the mini-phone mockup screen is a
   decorative fixed-size image; a raw <img> keeps this a 1:1 port of the design */

import { useEffect, useState } from "react";
import { FlowerMark } from "./flower-mark";
import { ArrowRight } from "./icons";

const SLIDE_TAGS = ["Undangan Website", "Buku Tamu Digital"];

// "Apa Kamu Dapat" — feature bento: one featured card (with an auto-advancing
// two-slide showcase) plus a three-card icon grid. Ports heroFeatureSlides().
export function Features() {
  const [active, setActive] = useState(0);

  // Auto-advance every 4.4s; keying the timeout on `active` means a manual dot
  // click (which sets active) also resets the dwell timer, matching the design.
  // Pauses when the user prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % SLIDE_TAGS.length), 4400);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <section className="sec ivory">
      <div className="sec-head reveal" style={{ marginBottom: 72 }}>
        <div className="chip">Apa Kamu Dapat</div>
        <h2>
          Empat fitur, satu undangan.<br />
          <em>Beres tanpa ribet.</em>
        </h2>
      </div>

      {/* Feature bento — one featured card + icon-card grid */}
      <div className="feats">
        <div className="feat-hero reveal">
          <div className="feat-hero-body">
            <div className="fh-eyebrow">
              <span className="n">01</span>
              <span className="ln" />
              Fitur Utama
            </div>
            <h3>
              Undangan website &amp; <em>buku tamu QR</em> — satu aplikasi.
            </h3>
            <p>
              Satu link cantik berisi cerita kalian — template editorial, musik, animasi halus.
              Di hari-H, tamu cukup scan QR dan buku tamu terisi real-time otomatis.
            </p>
            <div className="fh-tags">
              <span className="fh-tag">Template editorial</span>
              <span className="fh-tag">Musik latar</span>
              <span className="fh-tag">QR check-in</span>
              <span className="fh-tag">Buku tamu real-time</span>
            </div>
          </div>

          <div className="feat-hero-visual">
            <span className="slide-tag">{SLIDE_TAGS[active]}</span>
            <div className="hero-slides">
              {/* Slide 1 — undangan website + live check-in card */}
              <div className={`hero-slide${active === 0 ? " is-active" : ""}`}>
                <div className="mp-checkin">
                  <div className="ck-head">
                    <span className="ck-title">
                      <FlowerMark className="fm" inner={false} stamen="none" />
                      Buku Tamu
                    </span>
                    <span className="ck-qr">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <path d="M14 14h3v3" />
                        <path d="M21 14v.01" />
                        <path d="M14 21h.01" />
                        <path d="M21 18v3" />
                        <path d="M18 21h3" />
                      </svg>
                    </span>
                  </div>
                  <div className="ck-row">
                    <span className="ck-av">RH</span>
                    <div>
                      <div className="ck-nm">Reza Hartono</div>
                      <div className="ck-meta">Pihak Andi · Meja 4</div>
                    </div>
                    <span className="ck-done">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4a4c34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Hadir
                    </span>
                  </div>
                </div>
                <div className="mini-phone">
                  <img src="/invitation/folk/cover.webp" alt="Contoh undangan website Maritare" />
                  <div className="mp-open">Buka Undangan</div>
                </div>
              </div>

              {/* Slide 2 — buku tamu digital on iPad */}
              <div className={`hero-slide slide-gb${active === 1 ? " is-active" : ""}`}>
                <div className="mp-toast">
                  <span className="av">DL</span>
                  <div>
                    <div className="nm">Dewi Lestari</div>
                    <div className="sb">Baru saja check-in</div>
                  </div>
                </div>
                <div className="slide-ipad">
                  <div className="screen">
                    <div className="gbk">
                      <div className="gbk-head">
                        <div className="gbk-brand">
                          <FlowerMark inner stamen="center" coreR={9} />
                          <div>
                            <div className="gbk-eyebrow">Buku Tamu Digital · Online</div>
                            <div className="gbk-couple">
                              Andi <em>&amp;</em> Putri
                            </div>
                          </div>
                        </div>
                        <div className="gbk-counter">
                          <div className="gbk-count-num">
                            142 <span>/ 280</span>
                          </div>
                          <div className="gbk-count-lbl">Tamu hadir</div>
                        </div>
                      </div>
                      <div className="gbk-body">
                        <div className="gbk-tabs">
                          <span className="gbk-tab on">Cari Nama</span>
                          <span className="gbk-tab">Pindai QR</span>
                        </div>
                        <div className="gbk-h">
                          Selamat datang. Siapa <em>namamu?</em>
                        </div>
                        <div className="gbk-search">
                          <span className="s-ico">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <circle cx="11" cy="11" r="7" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                          </span>
                          <span className="s-txt">
                            Reza<span className="s-caret" />
                          </span>
                          <span className="s-btn">Cari</span>
                        </div>
                        <div className="gbk-results">
                          <div className="gbk-meta">2 nama cocok</div>
                          <div className="gbk-row on">
                            <span className="gbk-av b">RH</span>
                            <div className="gbk-row-main">
                              <div className="gbk-row-name">Reza Hartono</div>
                              <div className="gbk-row-sub">Keluarga Mempelai Pria · Pihak Andi</div>
                            </div>
                            <span className="r-arrow">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                          <div className="gbk-row">
                            <span className="gbk-av s">RB</span>
                            <div className="gbk-row-main">
                              <div className="gbk-row-name">Reza Bayu Pratama</div>
                              <div className="gbk-row-sub">Teman SMA Andi · Pihak Andi</div>
                            </div>
                            <span className="r-done">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4a4c34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                              Hadir
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-dots">
              {SLIDE_TAGS.map((tag, k) => (
                <button
                  key={tag}
                  type="button"
                  className={`hero-dot${active === k ? " on" : ""}`}
                  aria-label={tag}
                  onClick={() => setActive(k)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="feat-cards reveal-stagger">
          <a href="#" className="feat-card c-terra">
            <span className="feat-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
                <path d="M8.5 12h.01M12.5 12h.01M16.5 12h.01" />
              </svg>
            </span>
            <span className="fc-num">02</span>
            <h3>
              Sebar via WhatsApp, <em>sekali klik.</em>
            </h3>
            <p>
              Broadcast ke ratusan tamu otomatis. Setiap pesan personalized dengan nama tamu
              masing-masing — tanpa copy-paste manual.
            </p>
            <span className="fc-go">
              <ArrowRight size={13} strokeWidth={1.9} />
            </span>
          </a>
          <a href="#" className="feat-card c-sage">
            <span className="feat-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="fc-num">03</span>
            <h3>
              Estimasi tamu, <em>terhitung otomatis.</em>
            </h3>
            <p>
              Tamu konfirmasi sekaligus jumlah pendamping — solo, pasangan, keluarga. Total update
              real-time untuk konsumsi dan tempat duduk.
            </p>
            <span className="fc-go">
              <ArrowRight size={13} strokeWidth={1.9} />
            </span>
          </a>
          <a href="#" className="feat-card c-terra">
            <span className="feat-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </span>
            <span className="fc-num">04</span>
            <h3>
              Dashboard hari-H, <em>di genggaman.</em>
            </h3>
            <p>
              Pantau langsung dari hp — siapa sudah datang, jumlah amplop masuk, total tamu. Semua
              real-time, tanpa refresh manual.
            </p>
            <span className="fc-go">
              <ArrowRight size={13} strokeWidth={1.9} />
            </span>
          </a>
        </div>
      </div>

      <div className="feature-foot reveal">
        <div className="ff-meta">
          <span className="ff-dash" />
          Empat fitur, termasuk di semua paket — tanpa biaya tersembunyi.
        </div>
        <a href="#harga" className="ff-cta">
          Lihat harga &amp; paket
          <span className="arrow-circle">
            <ArrowRight size={14} strokeWidth={1.8} />
          </span>
        </a>
      </div>
    </section>
  );
}
