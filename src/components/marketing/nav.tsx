"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlowerMark } from "./flower-mark";
import { ArrowUpRight, Phone } from "./icons";

// Ports the design's navBehavior IIFE: the bar overlays the hero, becomes
// fixed past 4px, swaps to its light "scrolled" skin past the hero, and
// auto-hides on downward scroll / reappears on upward scroll.
export function Nav() {
  const [sticky, setSticky] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const heroH = hero ? hero.offsetHeight : 600;
    let last = 0;

    const update = () => {
      const y = window.scrollY;
      setSticky(y > 4);
      setScrolled(y > heroH - 120);
      setHidden((prev) => {
        if (y > 200 && y > last + 6) return true;
        if (y < last - 6 || y < 100) return false;
        return prev;
      });
      last = y;
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  const cls = ["nav", sticky && "is-sticky", scrolled && "scrolled", hidden && "hidden"]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={cls} id="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <div className="nav-links">
            <a href="#beranda">Beranda</a>
          </div>
        </div>

        <a href="#" className="logo">
          maritare
          <FlowerMark />
        </a>

        <div className="nav-right">
          <div className="right-links">
            <div className="nav-links">
              <a href="#harga">Harga</a>
            </div>
          </div>
          <button className="icon-circ" aria-label="Telepon">
            <Phone size={16} />
          </button>
          <Link href="/login?mode=signup" className="btn btn-primary">
            Mulai bikin
            <span className="arrow-bg">
              <ArrowUpRight size={11} strokeWidth={2.4} />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
