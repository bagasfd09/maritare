"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { BrandPanel, FormOrnament } from "./brand-panel";
import { registerUser } from "@/server/actions/auth";

type Mode = "signin" | "signup";

export function AuthScreen({ initialMode = "signin" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [revealed, setRevealed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
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

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    const form = formRef.current;
    if (form) {
      form.classList.remove("in");
      requestAnimationFrame(() => requestAnimationFrame(() => form.classList.add("in")));
    }
  };

  // Email + password auth. On signup we create the account first, then sign in.
  // After a successful sign-in we do a full navigation to /dashboard so the new
  // session cookie is read by the server layout — which bounces admins to /admin.
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email || !password) {
      setError("Isi email dan kata sandi dulu.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Isi nama lengkap dulu.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await registerUser({ name, email, password });
        if (!res.ok) {
          setError(res.error);
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        setError(
          mode === "signup"
            ? "Akun dibuat, tapi gagal masuk otomatis. Coba masuk manual."
            : "Email atau kata sandi salah.",
        );
        setLoading(false);
        return;
      }

      window.location.assign("/dashboard");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" ref={screenRef}>
      <div className="frame">
        <div className="page">
          <div className="auth" id="auth" data-mode={mode} data-brand="bloom">
            <BrandPanel
              eyebrow={{ mid: "Volume 01 · Atelier", right: "Edisi Maret" }}
              tag={
                <>
                  Tempat <em>cerita kalian</em> dirancang seperti karya — surat cinta, undangan, dan
                  setiap detail kecil yang membuatnya milikmu sendiri.
                </>
              }
            />

            {/* ============ RIGHT — Form ============ */}
            <section className="auth-form">
              <FormOrnament />

              <div className="auth-form-inner">
                <div className="form-top reveal">
                  <div className="tab-switch" data-mode={mode}>
                    <span className="pill" />
                    <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>
                      Masuk
                    </button>
                    <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>
                      Daftar
                    </button>
                  </div>
                  <div className="help">
                    <span className="only-signin">
                      Belum punya akun?
                      <a href="#" onClick={(e) => { e.preventDefault(); switchMode("signup"); }}>Daftar gratis</a>
                    </span>
                    <span className="only-signup">
                      Sudah punya akun?
                      <a href="#" onClick={(e) => { e.preventDefault(); switchMode("signin"); }}>Masuk di sini</a>
                    </span>
                  </div>
                </div>

                <div className="form-head reveal">
                  <div className="chip-mini">
                    <span className="only-signin">Selamat datang kembali</span>
                    <span className="only-signup">Mulai cerita kalian</span>
                  </div>
                  <h1>
                    <span className="only-signin">Lanjutkan merancang<br /><em>hari pentingmu.</em></span>
                    <span className="only-signup">Buat akun &amp; mulai<br /><em>undangan editorialmu.</em></span>
                  </h1>
                  <p>
                    <span className="only-signin">Masuk untuk melanjutkan progress undangan, pantau RSVP, dan lihat amplop digital yang masuk.</span>
                    <span className="only-signup">Gratis untuk dicoba — kamu hanya bayar saat undanganmu siap dibagikan ke tamu.</span>
                  </p>
                </div>

                <form ref={formRef} className="reveal-stagger" onSubmit={onSubmit}>
                  <button type="button" className="btn-google" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                    <svg viewBox="0 0 18 18" aria-hidden>
                      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.63z" />
                      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                      <path fill="#FBBC04" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
                      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z" />
                    </svg>
                    <span>
                      <span className="only-signin">Masuk dengan Google</span>
                      <span className="only-signup">Daftar dengan Google</span>
                    </span>
                  </button>

                  <div className="divider">atau dengan email</div>

                  <div className="field-group">
                    <div className="field only-signup">
                      <label htmlFor="name">Nama lengkap</label>
                      <div className="input-wrap">
                        <span className="ic">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="name"
                          placeholder="Maya &amp; Reza"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="email">Alamat email</label>
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="password">
                        <span className="only-signin">Kata sandi</span>
                        <span className="only-signup">Buat kata sandi</span>
                      </label>
                      <div className="input-wrap">
                        <span className="ic">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        <input
                          type={revealed ? "text" : "password"}
                          id="password"
                          placeholder={mode === "signup" ? "Minimal 8 karakter" : "Masukkan kata sandi"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        />
                        <button
                          type="button"
                          className="reveal-btn"
                          aria-label="Lihat kata sandi"
                          onClick={() => setRevealed((v) => !v)}
                        >
                          {revealed ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <path d="m1 1 22 22" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="helpers">
                    <label className="check only-signin">
                      <input type="checkbox" id="remember" defaultChecked />
                      <span className="lbl">Ingat saya selama 30 hari</span>
                    </label>
                    <a href="/forgot-password" className="forgot only-signin">Lupa kata sandi?</a>
                    <label className="check only-signup">
                      <input type="checkbox" id="terms" />
                      <span className="lbl">
                        Saya setuju dengan <a href="#">Syarat</a> &amp; <a href="#">Kebijakan Privasi</a> Maritare
                      </span>
                    </label>
                  </div>

                  {error && (
                    <p role="alert" style={{ color: "var(--accent-oxblood, #7C2D2D)", fontSize: 13, margin: "0 0 10px" }}>
                      {error}
                    </p>
                  )}

                  <button type="submit" className="btn-submit" disabled={loading} aria-busy={loading}>
                    <span>
                      {loading ? (
                        <span>Memproses…</span>
                      ) : (
                        <>
                          <span className="only-signin">Masuk ke Maritare</span>
                          <span className="only-signup">Buat akun gratis</span>
                        </>
                      )}
                    </span>
                    <span className="cta-mark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </span>
                  </button>

                </form>

                <div className="form-foot">
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
