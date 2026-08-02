"use client";

// Onyx floating nav — the reference's `FloatingNav`: a transparent bar that
// gains a blur + hairline once scrolled, the couple's initials on the left, the
// section links on the right, collapsing to a hamburger under `md`.
//
// The link list is passed IN rather than hard-coded: Onyx sections self-hide
// when their data is empty (no story, no gallery, no gift…), and a nav link
// pointing at a section that never rendered would scroll nowhere. The template
// builds the list from the same conditions the sections use.

import { useEffect, useState } from "react";

import { ONYX, gold, warm } from "./onyx-theme";

export type OnyxNavLink = { label: string; id: string };

type Props = { initials: string; links: OnyxNavLink[] };

export function OnyxNav({ initials, links }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (links.length === 0) {
    return null;
  }

  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: `${scrolled ? "0.9rem" : "1.4rem"} clamp(1.25rem, 4vw, 4rem)`,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        backgroundColor: scrolled ? "rgba(13,13,13,0.55)" : "transparent",
        borderBottom: scrolled ? `1px solid ${gold(0.12)}` : "1px solid transparent",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: ONYX.font.display,
          fontSize: "1.15rem",
          fontWeight: 400,
          letterSpacing: "0.08em",
          color: ONYX.color.warmWhite,
        }}
      >
        {initials}
      </button>

      <div className="hidden md:flex" style={{ gap: "2.5rem", alignItems: "center" }}>
        {links.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => go(l.id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: ONYX.font.body,
              fontSize: "0.6rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: ONYX.color.warmWhite,
              opacity: 0.65,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.65";
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="md:hidden"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={menuOpen}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "22px",
              height: "1px",
              backgroundColor: ONYX.color.warmWhite,
              transition: "all 0.3s ease",
              transform:
                menuOpen && i === 0
                  ? "rotate(45deg) translate(4px, 4px)"
                  : menuOpen && i === 2
                    ? "rotate(-45deg) translate(4px, -4px)"
                    : menuOpen && i === 1
                      ? "scaleX(0)"
                      : "none",
            }}
          />
        ))}
      </button>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "rgba(13,13,13,0.97)",
            backdropFilter: "blur(16px)",
            borderBottom: `1px solid ${gold(0.12)}`,
            padding: "1.5rem clamp(1.25rem, 4vw, 4rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => go(l.id)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                textAlign: "left",
                cursor: "pointer",
                fontFamily: ONYX.font.body,
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: warm(0.75),
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

/** Back-to-top pill, the reference's `BackToTop` — appears past 500px. */
export function OnyxBackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      style={{
        position: "fixed",
        bottom: "clamp(1rem, 3vw, 2rem)",
        right: "clamp(1rem, 3vw, 2rem)",
        zIndex: 40,
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        backgroundColor: "rgba(23,23,23,0.88)",
        border: `1px solid ${gold(0.28)}`,
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: ONYX.color.champagne,
        fontSize: "0.85rem",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      ↑
    </button>
  );
}
