"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments + presigned R2 srcs use raw <img> by design (next/image would re-proxy/break signed urls) */

// Scarlet wedding gift â€” ported VERBATIM from <section.wedding-gift-wrap> in
// scarlet-body.ts. The single static .bank-item is replaced by one card per
// data.sections.amplop.accounts[] and per ewallets[], keeping the exact
// .bank-detail / .bank-account-number-wrap / .bank-copy markup. The copy button
// becomes a client handler (strip spaces/dashes â†’ clipboard, "Tersalin"/"Salin"
// label swap). Returns null when both account lists are empty. An optional
// gift-address block renders after the bank cards when present.

import { useEffect, useRef, useState } from "react";

import { resolveBankLogo } from "@/lib/invitation/bank-logos";
import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Folk shows the bank's own logo only (hides the bank-name text) when a logo
   *  exists for that bank; unknown banks still fall back to the name as text. */
  logoOnly?: boolean;
};

export function ScarletGift({ data, logoOnly }: Props) {
  const { accounts, ewallets, giftAddress } = data.sections.amplop;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  if (accounts.length === 0 && ewallets.length === 0 && !giftAddress?.trim()) {
    return null;
  }

  const handleCopy = (key: string, value: string) => {
    // Strip spaces/dashes so the pasted number is bank-app ready.
    void navigator.clipboard
      .writeText(value.replace(/[\s-]/g, ""))
      .then(() => {
        setCopiedKey(key);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopiedKey(null), 2000);
      })
      .catch(() => {
        // Clipboard unavailable (http / old browser) â€” quietly do nothing.
      });
  };

  type GiftAccount = { key: string; label: string; number: string; holder: string };
  const cards: GiftAccount[] = [
    ...accounts.map((a, i) => ({
      key: `bank-${i}`,
      label: a.bank,
      number: a.number,
      holder: a.holder,
    })),
    ...ewallets.map((w, i) => ({
      key: `ewallet-${i}`,
      label: w.provider,
      number: w.number,
      holder: w.holder,
    })),
  ];

  return (
    <section className="wedding-gift-wrap">
      <div className="orn-clip-mask">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-clip.webp" alt="Ornament" />
        </div>
      </div>

      <div className="wedding-gift-inner">
        <div className="wedding-gift-content-wrapper">
          <div className="frame-bank">
            <div
              className="image-wrap"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="600"
            >
              <img loading="lazy" decoding="async" src="/invitation/scarlet/frame-bank.webp" alt="orn-cover" />
            </div>

            <div className="ornaments-wrapper">
              <div className="orn-bank-1">
                <div className="orn-bank-1-1">
                  <div className="orn-bank-1-1-1">
                    <div
                      className="image-wrap"
                      data-aos="fade-up"
                      data-aos-duration="1400"
                      data-aos-delay="700"
                    >
                      <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-38.webp" alt="" />
                    </div>
                  </div>
                  <div
                    className="image-wrap"
                    data-aos="fade-up"
                    data-aos-duration="1200"
                    data-aos-delay="600"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-14.webp" alt="" />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1000"
                  data-aos-delay="500"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-37.webp" alt="" />
                </div>
              </div>
              <div className="orn-bank-3">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1400"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-12.webp" alt="" />
                </div>
              </div>
              <div className="orn-bank-2">
                <div className="orn-bank-2-1">
                  <div
                    className="image-wrap"
                    data-aos="zoom-in"
                    data-aos-duration="1200"
                    data-aos-delay="600"
                  >
                    <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-40.webp" alt="" />
                  </div>
                </div>
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1000"
                  data-aos-delay="500"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-39.webp" alt="" />
                </div>
              </div>
              <div className="orn-bank-4 right">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-30.webp" alt="" />
                </div>
              </div>
              <div className="orn-bank-4 left">
                <div
                  className="image-wrap"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-delay="700"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-30.webp" alt="" />
                </div>
              </div>

              <div className="orn-bank-5 burung-1">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-1.webp" alt="Ornament" />
                </div>
              </div>
              <div className="orn-bank-6 burung-2">
                <div
                  className="image-wrap"
                  data-aos="zoom-in"
                  data-aos-duration="1200"
                  data-aos-delay="1000"
                >
                  <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-burung-2.webp" alt="Ornament" />
                </div>
              </div>
            </div>
          </div>
          <div className="wedding-gift-content">
            <div className="wedding-gift-head">
              <h1 className="wedding-gift-title" data-aos="fade-up" data-aos-duration="1200">
                Wedding Gift
              </h1>
              <p className="wedding-gift-description" data-aos="fade-up" data-aos-duration="1200">
                Kehadiran dan doamu adalah hadiah terindah. Namun jika ingin memberi tanda kasih,
                kami sediakan amplop digital untuk memudahkanmu. Terima kasih
              </p>
            </div>

            <div
              className="gift-frame no-scrollbar"
              data-aos="zoom-in"
              data-aos-duration="1200"
              data-aos-delay="700"
            >
              <div className="wedding-gift-body">
                {/* Bank Wrap */}
                <div className="wedding-gift-bank-wrap">
                  {cards.map((card) => {
                    const copied = copiedKey === card.key;
                    // Show the bank's own logo when we have one; otherwise fall back
                    // to the name as text (never a wrong logo). Folk hides the name
                    // text whenever a logo is shown.
                    const logo = resolveBankLogo(card.label);
                    const showName = !logoOnly || !logo;
                    return (
                      <div className="bank-item" key={card.key}>
                        <div className="bank-detail">
                          {logo && (
                            <div className="bank-logo">
                              <div
                                className="image-wrap"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-delay="600"
                              >
                                <img loading="lazy" decoding="async" src={logo} alt={card.label} />
                              </div>
                            </div>
                          )}
                          {showName && (
                            <p
                              className="bank-name"
                              data-aos="zoom-in"
                              data-aos-duration="1000"
                              data-aos-delay="850"
                            >
                              {card.label}
                            </p>
                          )}
                          <p
                            className="bank-account-name"
                            data-aos="zoom-in"
                            data-aos-duration="1000"
                            data-aos-delay="900"
                          >
                            Acc. name : {card.holder}
                          </p>
                          <div
                            className="bank-account-number-wrap"
                            data-aos="zoom-in"
                            data-aos-duration="1000"
                            data-aos-delay="1000"
                          >
                            <p
                              className="bank-account-number"
                              data-aos="zoom-in"
                              data-aos-duration="1000"
                              data-aos-delay="800"
                            >
                              Acc. number : {card.number}
                            </p>
                            <button
                              type="button"
                              className="bank-copy"
                              data-copy={card.number}
                              onClick={() => handleCopy(card.key, card.number)}
                              aria-label={copied ? "Tersalin" : "Salin"}
                            >
                              <i className={copied ? "ph ph-check" : "ph ph-copy-simple"} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {giftAddress && (
                  <div className="wedding-gift-address-wrap" data-aos="fade-up" data-aos-duration="1200">
                    <p className="inner-recipient-info name">Kirim Kado</p>
                    <p className="inner-address-info">{giftAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
