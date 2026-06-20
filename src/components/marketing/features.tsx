import { ArrowUpRight } from "./icons";

// "Apa Kamu Dapat" — a calm numbered editorial index. Seven feature rows, no
// per-row mockups, mirroring the design exactly.
const FEATURES = [
  {
    num: "01",
    pre: "Undangan website, ",
    em: "bukan template kaku.",
    desc: "Satu link cantik berisi cerita kalian — template editorial, musik latar pilihan, dan animasi halus. Bagikan lewat WhatsApp, beres.",
    aria: "Pelajari Undangan Website",
  },
  {
    num: "02",
    pre: "Sebar via WhatsApp, ",
    em: "sekali klik.",
    desc: "Broadcast ke ratusan tamu otomatis. Setiap pesan personalized dengan nama tamu masing-masing — tanpa copy-paste manual.",
    aria: "Pelajari WhatsApp Broadcast",
  },
  {
    num: "03",
    pre: "Estimasi tamu, ",
    em: "terhitung otomatis.",
    desc: "Tamu konfirmasi sekaligus jumlah pendamping — solo, pasangan, keluarga. Total update real-time, gampang siapkan konsumsi dan tempat duduk.",
    aria: "Pelajari Estimasi Tamu",
  },
  {
    num: "04",
    pre: "QR check-in ",
    em: "di pintu masuk.",
    desc: "Tamu scan QR, buku tamu real-time terisi otomatis. Tahu siapa sudah datang tanpa repot menulis manual.",
    aria: "Pelajari QR Check-in",
  },
  {
    num: "05",
    pre: "Ucapan lewat ",
    em: "voice note.",
    desc: "Biar tamu kirim doa dan ucapan lewat suara — bukan teks dingin. Lebih hangat, lebih personal, bisa kalian putar kapan saja.",
    aria: "Pelajari Voice Note",
  },
  {
    num: "06",
    pre: "Amplop digital, ",
    em: "tampil di layar.",
    desc: "Tamu kirim ucapan dan saweran — gratis atau berbayar, kalian yang atur. Muncul langsung di TV venue sebagai live feed.",
    aria: "Pelajari Amplop Digital",
  },
  {
    num: "07",
    pre: "Dashboard hari-H, ",
    em: "di genggaman.",
    desc: "Pantau langsung dari hp — siapa sudah datang, jumlah amplop masuk, total tamu. Semua real-time, tanpa refresh manual.",
    aria: "Pelajari Dashboard",
  },
];

export function Features() {
  return (
    <section className="sec ivory">
      <div className="sec-head reveal" style={{ marginBottom: 72 }}>
        <div className="chip">Apa Kamu Dapat</div>
        <h2>
          Tujuh fitur, satu undangan.<br />
          <em>Beres tanpa ribet.</em>
        </h2>
      </div>

      <ol className="feature-index reveal-stagger">
        {FEATURES.map((f) => (
          <li className="feat-row" key={f.num}>
            <span className="feat-num">{f.num}</span>
            <h3 className="feat-title">
              {f.pre}
              <em>{f.em}</em>
            </h3>
            <p className="feat-desc">{f.desc}</p>
            <a href="#" className="feat-arrow" aria-label={f.aria}>
              <ArrowUpRight size={14} strokeWidth={1.8} />
            </a>
          </li>
        ))}
      </ol>

      <div className="feature-foot reveal">
        <div className="ff-meta">
          <span className="ff-dash" />
          Tujuh fitur, termasuk di semua paket — tanpa biaya tersembunyi.
        </div>
        <a href="#harga" className="ff-cta">
          Lihat harga &amp; paket
          <span className="arrow-circle">
            <ArrowUpRight size={14} strokeWidth={1.8} />
          </span>
        </a>
      </div>
    </section>
  );
}
