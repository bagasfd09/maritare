"use client";

import { useState } from "react";
import { ChevronDown } from "./icons";
import { faqs } from "./data";

// Accordion — one item open at a time (the design defaults the first open).
// Open/close visuals are CSS-driven via `.faq-item.open`.
export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="faq">
      <div className="sec-head reveal">
        <div className="chip">Pertanyaan Umum</div>
        <h2>
          Hal-hal yang sering<br />
          <em>ditanyakan</em> calon pengantin.
        </h2>
      </div>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <div className={`faq-item${open === i ? " open" : ""}`} key={item.q}>
            <button type="button" className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{item.q}</span>
              <span className="chev">
                <ChevronDown size={14} strokeWidth={2} />
              </span>
            </button>
            <div className="faq-a">{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
