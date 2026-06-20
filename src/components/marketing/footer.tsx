import { FlowerMark } from "./flower-mark";

const COLUMNS = [
  { title: "Produk", links: ["Template", "Harga", "Fitur lengkap", "Roadmap 2026"] },
  { title: "Cerita", links: ["Pasangan kami", "Journal", "Inspirasi", "Kontributor"] },
  { title: "Bantuan", links: ["FAQ", "Hubungi kami", "WhatsApp", "Status sistem"] },
];

export function Footer() {
  return (
    <footer className="foot">
      <h2 className="foot-mega">
        maritare
        <FlowerMark />
      </h2>

      <div className="foot-cols">
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
            <a className="social" href="#" aria-label="Pinterest">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.65 19.31c-.05-.85-.1-2.16.02-3.1.11-.86 1.18-5.48 1.18-5.48s-.3-.6-.3-1.49c0-1.4.81-2.45 1.82-2.45.86 0 1.27.65 1.27 1.42 0 .86-.55 2.16-.84 3.36-.24.99.51 1.81 1.5 1.81 1.8 0 3.18-1.9 3.18-4.63 0-2.42-1.74-4.11-4.22-4.11-2.87 0-4.56 2.15-4.56 4.38 0 .87.33 1.79.75 2.3.08.1.09.18.07.28-.07.31-.25 1.03-.28 1.18-.04.18-.15.22-.34.13-1.26-.58-2.05-2.42-2.05-3.9 0-3.18 2.31-6.1 6.65-6.1 3.49 0 6.21 2.49 6.21 5.81 0 3.47-2.19 6.26-5.22 6.26-1.02 0-1.97-.53-2.3-1.16l-.63 2.4c-.23.87-.84 1.97-1.25 2.64A10 10 0 1 0 12 2z" />
              </svg>
            </a>
            <a className="social" href="#" aria-label="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-1.7-.8-2.8-1.5-4-3.4-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5 0-.8.4-.3.4-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.4 5.4 4.8 2 .8 2.8.9 3.8.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.4 15.5L2 22l4.7-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 1 1 12 20z" />
              </svg>
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a className="foot-link" href="#">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="foot-bot">
        <div>Made with care in Jakarta · © 2026 Maritare</div>
        <div className="partners-mini">
          <span>Bridestory</span>
          <span>Femina</span>
          <span>Parents Guide</span>
        </div>
      </div>
    </footer>
  );
}
