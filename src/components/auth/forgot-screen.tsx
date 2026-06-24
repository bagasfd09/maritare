"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { BrandPanel, FormOrnament } from "./brand-panel";

export function ForgotScreen() {
  const [email, setEmail] = useState("");
  const screenRef = useRef<HTMLDivElement>(null);

  // Reveal-on-load stagger (ports the design's load animation).
  useEffect(() => {
    const els = screenRef.current?.querySelectorAll<HTMLElement>(".reveal, .reveal-stagger");
    if (!els) return;
    const t = setTimeout(() => {
      els.forEach((el, i) => setTimeout(() => el.classList.add("in"), i * 90));
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Passwordless backend (Auth.js Resend): "recover" = send a fresh sign-in
    // link to the registered email.
    if (email) signIn("resend", { email, callbackUrl: "/dashboard" });
  };

  return (
    <div className="auth-page" ref={screenRef}>
      <div className="frame">
        <div className="page">
          <div className="auth" id="auth" data-mode="signin" data-brand="bloom">
            <BrandPanel
              eyebrow={{ mid: "Pemulihan Akun", right: "Aman & terenkripsi" }}
              tag={
                <>
                  Tenang — kami akan bantu kamu kembali ke <em>rancangan undanganmu</em> dalam
                  hitungan menit.
                </>
              }
              stats={[
                { num: "256-bit", lbl: "Enkripsi" },
                { num: "15 mnt", lbl: "Masa berlaku" },
                { num: "2-FA", lbl: "Lapis verifikasi" },
              ]}
            />

            {/* ============ RIGHT — Forgot form ============ */}
            <section className="auth-form">
              <FormOrnament />

              <div className="auth-form-inner">
                <div className="form-top reveal">
                  <Link href="/login" className="step-back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span>
                      Kembali ke <strong>Masuk</strong>
                    </span>
                  </Link>
                  <div className="step-indicator">
                    <span className="dot is-on" />
                    <span className="line" />
                    <span className="dot" />
                    <span className="line" />
                    <span className="dot" />
                    <span className="step-label">Langkah 1 dari 3</span>
                  </div>
                </div>

                <div className="form-head reveal">
                  <div className="chip-mini">Pemulihan Akun</div>
                  <h1>
                    Lupa kata sandi?<br />
                    <em>Kita bantu pulihkan.</em>
                  </h1>
                  <p>
                    Masukkan email yang terdaftar. Kami akan kirim kode 6&nbsp;digit beserta tautan
                    aman untuk membuat kata sandi baru.
                  </p>
                </div>

                <form className="reveal-stagger" onSubmit={onSubmit}>
                  <div className="field-group">
                    <div className="field">
                      <label htmlFor="email">Email terdaftar</label>
                      <div className="input-wrap">
                        <span className="ic">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          id="email"
                          placeholder="kamu@email.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <p className="field-hint">
                        Pastikan email sama dengan yang dipakai saat mendaftar di Maritare.
                      </p>
                    </div>
                  </div>

                  <button type="submit" className="btn-submit">
                    <span>Kirim kode pemulihan</span>
                    <span className="cta-mark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </button>

                  <div className="alt-action">
                    <span>Ingat kata sandimu?</span>
                    <Link href="/login">Masuk di sini</Link>
                  </div>

                  <div className="trust">
                    <span className="sec-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="4" y="11" width="16" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      Tautan kedaluwarsa dalam 15 menit
                    </span>
                    <span className="dotsep" />
                    <span>Hanya kamu yang bisa membuka emailnya</span>
                  </div>
                </form>

                <div className="form-foot">
                  <div className="legal">
                    © 2026 Maritare · <a href="#">Syarat</a> · <a href="#">Privasi</a> · <a href="#">Bantuan</a>
                  </div>
                  <button className="lang" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15 15 0 0 1 0 20" />
                      <path d="M12 2a15 15 0 0 0 0 20" />
                    </svg>
                    ID · Bahasa
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
