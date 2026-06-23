/* eslint-disable @next/next/no-img-element -- the phone mockup screen is a
   decorative fixed-size image; a raw <img> keeps this a 1:1 port of the design */

import Link from "next/link";
import { FlowerMark } from "./flower-mark";

// Exact 21×21 QR cell pattern from the design ("1" = filled cell). Rendered into
// the .fi-qr grid so the scanner mockup matches the source pixel-for-pixel.
const QR_BITS =
  "111111100111001111111100000101110001000001101110100000101011101101110101000001011101101110100010101011101100000101100101000001111111101010101111111000000000011100000000000010100110011000011001000000010100001111111010110000001110101111011001100010001101000001101010110110110000000001010101101111111111100000001111111100000100011111000110101110100110001010110101110100011001000110101110101000001111101100000100010101101001111111100011001110100";

export function FinalCta() {
  return (
    <section className="final" id="finalCta">
      <span className="final-glow" />
      <FlowerMark className="final-mark one" inner={false} stamen="none" />
      <FlowerMark className="final-mark two" inner={false} stamen="none" />

      {/* decorative iPad — QR scanner */}
      <div className="final-ipad left">
        <div className="fi-screen">
          <div className="fi-top">
            <span className="fi-brand">
              <FlowerMark className="fm" inner={false} stamen="none" />
              Buku Tamu Digital
            </span>
            <span className="fi-live">
              <span className="d" />
              Live
            </span>
          </div>
          <div className="fi-body">
            <div className="fi-frame">
              <span className="fi-corner tl" />
              <span className="fi-corner tr" />
              <span className="fi-corner bl" />
              <span className="fi-corner br" />
              <div className="fi-qr">
                {QR_BITS.split("").map((b, i) => (
                  <i key={i} className={b === "1" ? "on" : undefined} />
                ))}
              </div>
              <div className="fi-laser" />
            </div>
            <div className="fi-cap">
              Pindai <em>QR undangan</em>
            </div>
            <div className="fi-sub">Arahkan QR di undangan ke kamera — beres.</div>
          </div>
        </div>
      </div>

      {/* decorative phone — contoh undangan */}
      <div className="final-phone right">
        <span className="island" />
        <img src="/invitation/folk/cover.webp" alt="Contoh undangan Maritare" />
      </div>

      <div className="final-inner reveal">
        <div className="final-eyebrow">
          <span className="dot" />
          Mulai Sekarang
        </div>
        <h2>
          Mulai tulis<br />
          <em>hari bahagiamu.</em>
        </h2>
        <p className="final-lede">
          Rancang undangan pertama kalian dalam lima menit. Bayar hanya saat siap publish — tidak
          sebelumnya.
        </p>
        <div className="final-actions">
          <Link href="/login?mode=signup" className="final-btn">
            Rancang Undanganmu
            <FlowerMark className="fm" inner stamen="center" />
          </Link>
          <a href="#harga" className="final-link">
            Lihat harga lengkap
          </a>
        </div>
      </div>
    </section>
  );
}
