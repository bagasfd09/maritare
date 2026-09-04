// Onyx couple — the reference's `CoupleSection`: two circular portraits, each
// ringed by two concentric champagne hairlines, with an italic gold ampersand
// column between them on wide screens. DOM order is bride → ampersand → groom
// (the reference had groom first; swapped on request — the WHOLE card moves,
// portrait + names + parents + IG, so the two sides stay internally consistent).
//
// Bindings: the portrait comes from couplePhotoUrls (InvImage, never a raw
// <img>), the heading from the wedding's nickname (shortName, onyx-theme), and
// the parents block from childOrder / fatherName / motherName via parentsLines —
// copied from sienna-couple so every template renders parents identically.

import { Fragment } from "react";

import { COUPLE_INTRO_DEFAULTS, type PasanganData } from "@/lib/invitation/sections";
import type { InvitationView } from "@/server/queries/invitation";

import { InvImage } from "../scarlet/inv-image";
import { OnyxLabel } from "./onyx-atoms";
import { ONYX_SAMPLE } from "./onyx-sample";
import { OnyxReveal } from "./onyx-reveal";
import { ONYX, gold, shortName, warm } from "./onyx-theme";

type Props = { data: InvitationView; mode: "public" | "ownerPreview" | "editorPreview" };

type Person = PasanganData["groom"];

/**
 * Parents as AT MOST TWO lines, matching the reference exactly:
 *
 *   Putra dari Dadang Supriatna
 *   & Lilis Juarni
 *
 * The child-order phrase runs straight into the father's name instead of
 * sitting on its own line, and the names print bare. This deliberately differs
 * from the shared ivory/sienna `parentsLines` (which stacks three lines and
 * prefixes "Bapak"/"Ibu") — Onyx follows its own reference's typography, where a
 * third line breaks the card's vertical rhythm.
 */
function parentsLines(person: Person): string[] {
  if (!person.fatherName && !person.motherName) {
    return [];
  }
  const first = [person.childOrder, person.fatherName].filter(Boolean).join(" ");
  const second = person.motherName
    ? `${person.fatherName ? "& " : ""}${person.motherName}`
    : "";
  return [first, second].filter(Boolean);
}

function CoupleCard({
  person,
  nickname,
  photoUrl,
  bio,
  delay,
}: {
  person: Person;
  /** The wedding's short name (data.groomName | data.brideName) — the heading. */
  nickname: string;
  /** Always set — the caller falls back to the sample portrait. */
  photoUrl: string;
  bio: string;
  delay: number;
}) {
  const fullName = (person.fullName ?? "").trim();
  const displayName = fullName || nickname;
  const short = shortName(fullName, nickname);
  const parents = parentsLines(person);

  return (
    // width:100% — the grid sets justify-items:center, which otherwise sizes
    // each card to its content and wraps the parents line early. Filling the
    // column keeps that line on one row (see parentsLines: two lines, never
    // three).
    <OnyxReveal delay={delay} style={{ textAlign: "center", width: "100%" }}>
      <div style={{ position: "relative", display: "inline-block", marginBottom: "2rem" }}>
        <div
          className="onyx-zoom"
          style={{
            width: "clamp(200px, calc(30 * var(--onyx-vw)), 300px)",
            height: "clamp(200px, calc(30 * var(--onyx-vw)), 300px)",
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${gold(0.2)}`,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        >
          <InvImage src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
        </div>
        <div
          style={{
            position: "absolute",
            inset: "-10px",
            borderRadius: "50%",
            border: `1px solid ${gold(0.1)}`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-22px",
            borderRadius: "50%",
            border: `1px solid ${gold(0.05)}`,
            pointerEvents: "none",
          }}
        />
      </div>

      <OnyxLabel>{bio}</OnyxLabel>
      <h3
        style={{
          fontFamily: ONYX.font.display,
          fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3rem)",
          fontWeight: 300,
          color: ONYX.color.warmWhite,
          margin: "0 0 0.2rem",
          letterSpacing: "-0.01em",
        }}
      >
        {short}
      </h3>
      <p
        style={{
          fontFamily: ONYX.font.display,
          fontStyle: "italic",
          fontSize: "clamp(0.9rem, calc(2 * var(--onyx-vw)), 1.1rem)",
          color: warm(0.75),
          marginBottom: "1rem",
          fontWeight: 300,
        }}
      >
        {displayName}
      </p>
      {parents.length > 0 && (
        <p
          style={{
            fontFamily: ONYX.font.body,
            fontSize: "0.82rem",
            color: warm(0.45),
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          {parents.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      )}
      {person.instagram && (
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "0.9rem",
            fontFamily: ONYX.font.body,
            fontSize: "0.58rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: ONYX.color.champagne,
            textDecoration: "none",
            borderBottom: `1px solid ${gold(0.4)}`,
            paddingBottom: "2px",
          }}
        >
          @{person.instagram}
        </a>
      )}
    </OnyxReveal>
  );
}

export function OnyxCouple({ data }: Props) {
  const { pasangan } = data.sections;
  // The reference's own heading is the default; the couple can override it from
  // the Mempelai form (intro.title), like scarlet/sienna.
  const heading = pasangan.intro?.title?.trim() || "Two Souls, One Light";
  const description = pasangan.intro?.description?.trim();

  return (
    <section
      id="onyx-couple"
      style={{ padding: "clamp(4rem, calc(8 * var(--onyx-vw)), 8rem) clamp(1.5rem, calc(5 * var(--onyx-vw)), 5rem)" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <OnyxReveal style={{ textAlign: "center", marginBottom: "clamp(3rem, calc(6 * var(--onyx-vw)), 5rem)" }}>
          <OnyxLabel>The Couple</OnyxLabel>
          <h2
            style={{
              fontFamily: ONYX.font.display,
              fontSize: "clamp(2rem, calc(5 * var(--onyx-vw)), 3.5rem)",
              fontWeight: 300,
              color: ONYX.color.warmWhite,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {heading}
          </h2>
          {description && description !== COUPLE_INTRO_DEFAULTS.description && (
            <p
              style={{
                fontFamily: ONYX.font.body,
                fontSize: "clamp(0.84rem, calc(2 * var(--onyx-vw)), 0.95rem)",
                lineHeight: 1.9,
                color: warm(0.45),
                fontWeight: 300,
                maxWidth: "560px",
                margin: "1.25rem auto 0",
              }}
            >
              {description}
            </p>
          )}
        </OnyxReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
            gap: "clamp(3rem, calc(6 * var(--onyx-vw)), 5rem)",
            alignItems: "start",
            justifyItems: "center",
          }}
        >
          <CoupleCard
            person={pasangan.bride}
            nickname={data.brideName}
            photoUrl={data.couplePhotoUrls.bride ?? ONYX_SAMPLE.bride}
            bio="The Bride"
            delay={0}
          />

          <OnyxReveal
            delay={100}
            className="onyx-amp hidden lg:flex"
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              paddingTop: "4.5rem",
            }}
          >
            <div
              style={{
                width: "1px",
                height: "56px",
                background: `linear-gradient(to bottom, transparent, ${gold(0.33)})`,
              }}
            />
            <p
              style={{
                fontFamily: ONYX.font.display,
                fontSize: "2.8rem",
                fontStyle: "italic",
                color: ONYX.color.champagne,
                fontWeight: 300,
                margin: 0,
              }}
            >
              &amp;
            </p>
            <div
              style={{
                width: "1px",
                height: "56px",
                background: `linear-gradient(to bottom, ${gold(0.33)}, transparent)`,
              }}
            />
          </OnyxReveal>

          <CoupleCard
            person={pasangan.groom}
            nickname={data.groomName}
            photoUrl={data.couplePhotoUrls.groom ?? ONYX_SAMPLE.groom}
            bio="The Groom"
            delay={150}
          />
        </div>
      </div>
    </section>
  );
}
