import Link from "next/link";
import { Check, ArrowUpRight } from "./icons";

// "Investasi" — a three-tier comparison table. Faithful to the design's
// pkg-table grid: a header row of tiers, nine feature rows, a CTA row, and a
// reassurance strip. Server component; no interaction.

const TIERS = [
  { roman: "I", name: "Silver", price: "150", gold: false, best: false },
  { roman: "II", name: "Gold", price: "300", gold: true, best: true },
  { roman: "III", name: "Platinum", price: "500", gold: false, best: false },
];

type Cell = "check" | "dash" | "inf" | string;
type Row = { label: string; meta?: string; groupStart?: boolean; values: [Cell, Cell, Cell] };

const ROWS: Row[] = [
  { label: "Jumlah tamu undangan", groupStart: true, values: ["100", "inf", "inf"] },
  { label: "Template editorial", values: ["Tier Silver", "Silver + Gold", "Semua tier"] },
  { label: "Galeri foto", values: ["5 foto", "50 foto", "100 foto · HD"] },
  { label: "Buku tamu digital ", meta: "(akun penjaga)", values: ["1 akun", "2 akun", "5 akun"] },
  { label: "Send undangan klik WhatsApp", values: ["check", "check", "check"] },
];

function CellValue({ value, gold, groupStart }: { value: Cell; gold: boolean; groupStart?: boolean }) {
  const cls = ["pkg-cell", "pkg-value", "center", gold && "is-gold", groupStart && "group-start"]
    .filter(Boolean)
    .join(" ");
  let inner: React.ReactNode;
  if (value === "check") inner = <Check className="pkg-check" size={24} strokeWidth={2} />;
  else if (value === "dash") inner = <span className="pkg-dash">—</span>;
  else if (value === "inf") inner = <span className="inf">∞</span>;
  else inner = value;
  return <div className={cls}>{inner}</div>;
}

// Ornament reused top-left / top-right of the section.
function PkgOrn({ side }: { side: "left" | "right" }) {
  return (
    <span className={`pkg-orn ${side}`} aria-hidden>
      <svg viewBox="-50 -50 100 100">
        {[0, 72, 144, 216, 288].map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path className="or-petal" d="M 0 -42 C 18 -42 22 -16 0 -2 C -22 -16 -18 -42 0 -42 Z" />
          </g>
        ))}
        <circle className="or-core" cx="0" cy="0" r="6" />
      </svg>
    </span>
  );
}

export function Pricing() {
  return (
    <section className="pricing" id="harga">
      <PkgOrn side="left" />
      <PkgOrn side="right" />

      <div className="pkg-head reveal">
        <div className="chip">Investasi</div>
        <h2>
          Bayar sekali.<br />
          <em>Tanpa kerumitan</em> langganan.
        </h2>
        <p className="pkg-lede">
          Tiga paket, satu janji — bayar di awal, pakai sampai hari-H. Semua paket aktif 1 tahun
          penuh, tanpa langganan bulanan.
        </p>
      </div>

      <div className="pkg-table reveal">
        {/* Header row */}
        <div className="pkg-cell pkg-h pkg-h-intro no-top">
          <span className="h-eyebrow">No. 06 / 08</span>
          <h3>
            Tiga bab,<br />
            <em>satu janji.</em>
          </h3>
        </div>
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`pkg-cell pkg-h pkg-h-tier no-top${t.gold ? " is-gold" : ""}`}
          >
            {t.best && (
              <span className="pkg-best-chip">
                <span>Paling Dicari</span>
              </span>
            )}
            <span className="pkg-h-roman">{t.roman}</span>
            <h4 className="pkg-h-name">{t.name}</h4>
            <div className="pkg-h-price">
              <span className="pkg-rp">Rp</span>
              <span className="pkg-num">{t.price}</span>
              <span className="pkg-k">rb</span>
            </div>
            <span className="pkg-h-per">Bayar sekali · 1 tahun aktif</span>
          </div>
        ))}

        {/* Body rows */}
        {ROWS.map((row) => (
          <Row key={row.label} row={row} />
        ))}

        {/* CTA row */}
        <div className="pkg-cell pkg-cta-empty" />
        {TIERS.map((t) => (
          <div key={t.name} className={`pkg-cell pkg-cta-cell center${t.gold ? " is-gold" : ""}`}>
            <Link
              href={`/login?mode=signin&plan=${t.name.toLowerCase()}`}
              className={`pkg-cta${t.gold ? " pkg-cta-primary" : ""}`}
            >
              Pilih {t.name}
              <span className="arrow-circle">
                <ArrowUpRight size={14} strokeWidth={2} />
              </span>
            </Link>
          </div>
        ))}
      </div>

      <div className="pkg-reassure reveal">
        <span className="pkg-r-item">
          <svg className="pkg-r-ico" viewBox="0 0 24 24">
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="m4.93 4.93 2.83 2.83" />
            <path d="m16.24 16.24 2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="m16.24 7.76 2.83-2.83" />
          </svg>
          <span>
            <strong>Update gratis</strong> selamanya, sampai hari-H tiba.
          </span>
        </span>
        <span className="pkg-r-sep" />
        <span className="pkg-r-item">
          <svg className="pkg-r-ico" viewBox="0 0 24 24">
            <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>
            <strong>Tanpa biaya tersembunyi.</strong> Yang tertulis, yang kalian bayar.
          </span>
        </span>
      </div>
    </section>
  );
}

function Row({ row }: { row: Row }) {
  return (
    <>
      <div className={`pkg-cell pkg-feature-label${row.groupStart ? " group-start" : ""}`}>
        {row.label}
        {row.meta && <span className="meta">{row.meta}</span>}
      </div>
      {row.values.map((v, i) => (
        <CellValue key={i} value={v} gold={i === 1} groupStart={row.groupStart} />
      ))}
    </>
  );
}
