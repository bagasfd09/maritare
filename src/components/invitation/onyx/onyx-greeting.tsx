// Onyx greeting — the reference's `GreetingSection`. The Bismillah label, the
// "With Love & Grace" heading and the invitation paragraph are the template's
// own design copy (kept verbatim); the verse block below the divider is bound to
// the editable opening quote (pasangan.quote: arabic / text / source) and hides
// itself entirely when the couple left the quote blank.

import { OnyxGoldLine, OnyxLabel, SECTION_PAD } from "./onyx-atoms";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, warm } from "./onyx-theme";

import type { InvitationView } from "@/server/queries/invitation";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

export function OnyxGreeting({ data }: Props) {
  const quote = data.sections.pasangan.quote;
  const arabic = quote?.arabic?.trim();
  const text = quote?.text?.trim();
  const source = quote?.source?.trim();

  return (
    <section style={{ padding: SECTION_PAD }}>
      <OnyxReveal style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <OnyxLabel>Bismillahirrahmanirrahim</OnyxLabel>
        <OnyxGoldLine vertical />
        <h2
          style={{
            fontFamily: ONYX.font.display,
            fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
            fontWeight: 300,
            color: ONYX.color.warmWhite,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            margin: "1.5rem 0 2rem",
          }}
        >
          With Love &amp; Grace
        </h2>
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "clamp(0.88rem, calc(2 * var(--onyx-vw)), 1rem)",
            lineHeight: 1.9,
            color: warm(0.5),
            marginBottom: "2rem",
            fontWeight: 300,
          }}
        >
          Assalamu&apos;alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridha Allah
          SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menyaksikan dan memberikan doa
          restu pada hari bahagia kami.
        </p>

        {(arabic || text || source) && (
          <>
            <div
              style={{
                width: "1px",
                height: "40px",
                background: `linear-gradient(to bottom, transparent, ${gold(0.4)}, transparent)`,
                margin: "0 auto 1.5rem",
              }}
            />
            {arabic && (
              <p
                dir="rtl"
                lang="ar"
                style={{
                  fontFamily: ONYX.font.display,
                  fontSize: "clamp(1.2rem, calc(3.5 * var(--onyx-vw)), 1.7rem)",
                  color: warm(0.75),
                  lineHeight: 2,
                  marginBottom: text ? "1.25rem" : 0,
                }}
              >
                {arabic}
              </p>
            )}
            {text && (
              <p
                style={{
                  fontFamily: ONYX.font.display,
                  fontStyle: "italic",
                  fontSize: "clamp(1rem, calc(2.5 * var(--onyx-vw)), 1.3rem)",
                  color: ONYX.color.warmWhite,
                  fontWeight: 300,
                  lineHeight: 1.75,
                  letterSpacing: "0.01em",
                }}
              >
                &quot;{text}&quot;
              </p>
            )}
            {source && (
              <p
                style={{
                  fontFamily: ONYX.font.body,
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  color: ONYX.color.champagne,
                  textTransform: "uppercase",
                  marginTop: "1.25rem",
                }}
              >
                {source}
              </p>
            )}
          </>
        )}
      </OnyxReveal>
    </section>
  );
}
