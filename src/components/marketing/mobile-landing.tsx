"use client";

/* eslint-disable @next/next/no-img-element -- decorative fixed-size mockup
   images; raw <img> keeps this a 1:1 port of the mobile design */

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlowerMark } from "./flower-mark";
import { faqs } from "./data";

const COVER = "/invitation/folk/cover.webp";

const FHM_LABELS = ["Undangan Website", "Buku Tamu Digital"];

const PLANS = [
  {
    roman: "I",
    name: "Silver",
    price: "150",
    gold: false,
    best: false,
    feats: [
      "100 tamu undangan",
      "Template editorial tier Silver",
      "Galeri 5 foto (compress)",
      "Buku tamu digital · 1 akun penjaga",
      "Send undangan klik WhatsApp",
    ],
  },
  {
    roman: "II",
    name: "Gold",
    price: "300",
    gold: true,
    best: true,
    feats: [
      "Tamu undangan unlimited",
      "Template tier Silver + Gold",
      "Galeri 50 foto (compress)",
      "Buku tamu digital · 2 akun penjaga",
      "Send undangan klik WhatsApp",
    ],
  },
  {
    roman: "III",
    name: "Platinum",
    price: "500",
    gold: false,
    best: false,
    feats: [
      "Tamu undangan unlimited",
      "Semua template editorial",
      "Galeri 100 foto HD",
      "Buku tamu digital · 5 akun penjaga",
      "Send undangan klik WhatsApp",
    ],
  },
];

const PCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export function MobileLanding() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [slide, setSlide] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);

  // nav scrolled state
  useEffect(() => {
    const onScroll = () => setNavScrolled((window.scrollY || 0) > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // featured-card slideshow (resets dwell on manual dot click via [slide] dep);
  // pauses when the user prefers reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setSlide((s) => (s + 1) % FHM_LABELS.length), 4400);
    return () => clearTimeout(id);
  }, [slide]);

  return (
    <div className="device">
      <div className="screen">
        <div className="app">
          {/* nav */}
          <nav className={`mnav${navScrolled ? " scrolled" : ""}`}>
            <a href="#m-top" className="logo">
              maritare
              <FlowerMark className="fm" inner stamen="center" />
            </a>
            <div className="mnav-right">
              <Link href="/login?mode=signup" className="pill">
                Mulai
              </Link>
              <button type="button" className="burger" aria-label="Menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </div>
          </nav>

          {/* HERO */}
          <section className="hero" id="m-top">
            <FlowerMark className="fm hero-wm" inner={false} stamen="none" />
            <div className="hero-eyebrow">
              <span className="dot" />
              Undangan Website
              <span className="pipe" />
              Buku Tamu
            </div>
            <h1>
              Undangan cantik, tamu tercatat <em>otomatis.</em>
            </h1>
            <p className="lede">
              Tamu buka undangan website yang indah lewat ponsel. Kamu pegang buku tamu digital
              yang mencatat kehadiran real-time di hari-H.
            </p>
            <Link href="/login?mode=signup" className="hero-cta">
              Rancang undanganmu
              <FlowerMark className="fm" inner stamen="center" />
            </Link>

            <div className="showcase">
              <div className="showcase-panel">
                <div className="showcase-cap">
                  <span>Pratinjau</span>
                  <span className="sep" />
                  <span className="live-d">Update real-time</span>
                </div>
                <div className="inv-wrap">
                  <div className="toast">
                    <span className="t-av">SW</span>
                    <div>
                      <div className="t-name">Sinta Wijaya</div>
                      <div className="t-sub">Baru saja check-in</div>
                    </div>
                  </div>
                  <div className="inv-card">
                    <img src={COVER} alt="Contoh undangan website Maritare" />
                    <div className="shade" />
                    <div className="open-btn">Buka Undangan</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* APA KAMU DAPAT */}
          <section className="sec ivory">
            <div className="chip">Apa Kamu Dapat</div>
            <h2 className="sec-h">
              Empat fitur, satu undangan.<br />
              <em>Beres tanpa ribet.</em>
            </h2>

            <div className="feat-hero-m">
              <div className="fhm-visual">
                <div className={`fhm-slide s1${slide === 0 ? " is-active" : ""}`}>
                  <div className="fhm-checkin">
                    <div className="ck-top">
                      <span className="ck-t">Buku Tamu</span>
                      <span className="ck-qr">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <path d="M14 14h3v3" />
                          <path d="M21 18v3" />
                          <path d="M18 21h3" />
                        </svg>
                      </span>
                    </div>
                    <div className="ck-r">
                      <span className="ck-a">RH</span>
                      <div>
                        <div className="ck-n">Reza Hartono</div>
                        <div className="ck-m">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          Hadir · Meja 4
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fhm-phone">
                    <img src={COVER} alt="Contoh undangan website Maritare" />
                  </div>
                </div>

                <div className={`fhm-slide s2${slide === 1 ? " is-active" : ""}`}>
                  <div className="fhm-gb">
                    <div className="g-head">
                      <span className="g-brand">
                        <FlowerMark className="fm" inner={false} stamen="none" />
                        <span className="g-ttl">Buku Tamu Digital</span>
                      </span>
                      <span className="g-cnt">
                        142 <span>/ 280</span>
                      </span>
                    </div>
                    <div className="g-search">
                      <span className="gi">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </span>
                      <span className="gt">
                        Reza<span className="gc" />
                      </span>
                    </div>
                    <div className="g-row on">
                      <span className="g-av b">RH</span>
                      <div className="g-main">
                        <div className="g-nm">Reza Hartono</div>
                        <div className="g-sub">Pihak Andi</div>
                      </div>
                      <span className="g-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                    <div className="g-row">
                      <span className="g-av s">DL</span>
                      <div className="g-main">
                        <div className="g-nm">Dewi Lestari</div>
                        <div className="g-sub">Pihak Putri</div>
                      </div>
                      <span className="g-done">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4a4c34" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        Hadir
                      </span>
                    </div>
                  </div>
                </div>

                <div className="fhm-dots">
                  {FHM_LABELS.map((label, k) => (
                    <button
                      key={label}
                      type="button"
                      className={`fhm-dot${slide === k ? " on" : ""}`}
                      aria-label={label}
                      onClick={() => setSlide(k)}
                    />
                  ))}
                </div>
              </div>
              <div className="fhm-body">
                <div className="fhm-eyebrow">
                  <span className="n">01</span>
                  <span className="ln" />
                  Fitur Utama
                </div>
                <h3>
                  Undangan website &amp; <em>buku tamu QR.</em>
                </h3>
                <p>
                  Satu link cantik berisi cerita kalian — template editorial, musik, animasi
                  halus. Di hari-H, tamu scan QR dan buku tamu terisi real-time otomatis.
                </p>
              </div>
            </div>

            <div className="feat-cards-m">
              <a href="#" className="feat-card-m c-terra">
                <span className="feat-ico-m">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
                    <path d="M8.5 12h.01M12.5 12h.01M16.5 12h.01" />
                  </svg>
                </span>
                <div>
                  <span className="fcm-num">02</span>
                  <h4>
                    Sebar via WhatsApp, <em>sekali klik.</em>
                  </h4>
                  <p>
                    Broadcast ke ratusan tamu otomatis. Setiap pesan personalized dengan nama tamu
                    — tanpa copy-paste.
                  </p>
                </div>
              </a>
              <a href="#" className="feat-card-m c-sage">
                <span className="feat-ico-m">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <div>
                  <span className="fcm-num">03</span>
                  <h4>
                    Estimasi tamu, <em>terhitung otomatis.</em>
                  </h4>
                  <p>
                    Tamu konfirmasi sekaligus jumlah pendamping. Total update real-time untuk
                    konsumsi dan tempat duduk.
                  </p>
                </div>
              </a>
              <a href="#" className="feat-card-m c-burg">
                <span className="feat-ico-m">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </span>
                <div>
                  <span className="fcm-num">04</span>
                  <h4>
                    Dashboard hari-H, <em>di genggaman.</em>
                  </h4>
                  <p>
                    Pantau dari hp — siapa sudah datang, jumlah amplop masuk, total tamu. Semua
                    real-time.
                  </p>
                </div>
              </a>
            </div>

            <div className="feat-foot">
              <div className="ff-meta">
                <span className="ff-dash" />
                Empat fitur, termasuk di semua paket — tanpa biaya tersembunyi.
              </div>
              <a href="#m-harga" className="ff-cta">
                Lihat harga &amp; paket
                <span className="ac">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </a>
            </div>
          </section>

          {/* PRICING */}
          <section className="sec pricing" id="m-harga">
            <div className="chip">Investasi</div>
            <h2 className="sec-h">
              Bayar sekali.<br />
              <em>Tanpa kerumitan</em> langganan.
            </h2>
            <div className="price-cards">
              {PLANS.map((p) => (
                <div key={p.name} className={`pcard${p.gold ? " gold" : ""}`}>
                  {p.best && <span className="best">Paling Dicari</span>}
                  <span className="roman">{p.roman}</span>
                  <div className="pname">{p.name}</div>
                  <div className="pprice">
                    <span className="rp">Rp</span>
                    <span className="num">{p.price}</span>
                    <span className="k">rb</span>
                  </div>
                  <div className="pper">Bayar sekali · 1 tahun aktif</div>
                  <ul>
                    {p.feats.map((f) => (
                      <li key={f}>
                        <PCheck />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login?mode=signup" className="pbtn">
                    Pilih {p.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="pkg-reassure">
              <span className="pkg-r-item">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                </svg>
                <span>
                  <strong>Update gratis</strong> selamanya, sampai hari-H tiba.
                </span>
              </span>
              <span className="pkg-r-item">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>
                  <strong>Tanpa biaya tersembunyi.</strong> Yang tertulis, yang kalian bayar.
                </span>
              </span>
            </div>
          </section>

          {/* FAQ */}
          <section className="sec ivory">
            <div className="chip">Pertanyaan Umum</div>
            <h2 className="sec-h">
              Hal yang sering<br />
              <em>ditanyakan.</em>
            </h2>
            <div className="faq-list">
              {faqs.map((item, i) => (
                <div className={`faq-item${faqOpen === i ? " open" : ""}`} key={item.q}>
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => setFaqOpen(faqOpen === i ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <span className="chev">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq-a">{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="final">
            <div className="final-card">
              <div className="f-eyebrow">Sebuah Undangan</div>
              <h2>
                Mulai tulis<br />
                <em>hari bahagiamu.</em>
              </h2>
              <p className="f-lede">
                Rancang undangan pertama kalian dalam lima menit. Bayar hanya saat siap publish —
                tidak sebelumnya.
              </p>
              <div className="final-divider">
                <span className="dr" />
                <FlowerMark className="fm" inner stamen="center" />
                <span className="dr" />
              </div>
              <Link href="/login?mode=signup" className="final-cta">
                Rancang Undanganmu
                <span className="ac">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </Link>
              <a href="#m-harga" className="final-link">
                atau lihat harga lengkap
              </a>
              <div className="final-signoff">Dengan rasa, dari Maritare</div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="foot">
            <h2 className="foot-mega">
              maritare
              <FlowerMark className="fm" inner stamen="center" />
            </h2>
            <div className="foot-brand">
              <p>
                Undangan digital editorial untuk pasangan yang ingin hari mereka diceritakan dengan
                rasa.
              </p>
              <div className="socials">
                <a className="social" href="#" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </a>
                <a className="social" href="#" aria-label="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53 1.5h3.3a5.42 5.42 0 0 0 4.67 4.85V9.6a8.6 8.6 0 0 1-4.65-1.4v6.51a6.51 6.51 0 1 1-6.5-6.51c.27 0 .53.02.78.05v3.3a3.27 3.27 0 1 0 2.4 3.16V1.5z" />
                  </svg>
                </a>
                <a className="social" href="#" aria-label="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-1.7-.8-2.8-1.5-4-3.4-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5 0-.8.4-.3.4-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.4 5.4 4.8 2 .8 2.8.9 3.8.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.4 15.5L2 22l4.7-1.5A10 10 0 1 0 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="foot-cols">
              <div>
                <h4>Produk</h4>
                <ul>
                  <li><a href="#">Template</a></li>
                  <li><a href="#m-harga">Harga</a></li>
                  <li><a href="#">Fitur lengkap</a></li>
                  <li><a href="#">Roadmap 2026</a></li>
                </ul>
              </div>
              <div>
                <h4>Cerita</h4>
                <ul>
                  <li><a href="#">Pasangan kami</a></li>
                  <li><a href="#">Journal</a></li>
                  <li><a href="#">Inspirasi</a></li>
                  <li><a href="#">Kontributor</a></li>
                </ul>
              </div>
              <div>
                <h4>Bantuan</h4>
                <ul>
                  <li><a href="#">FAQ</a></li>
                  <li><a href="#">Hubungi kami</a></li>
                  <li><a href="#">WhatsApp</a></li>
                  <li><a href="#">Status sistem</a></li>
                </ul>
              </div>
            </div>
            <div className="foot-bot">Made with care in Jakarta · © 2026 Maritare</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
