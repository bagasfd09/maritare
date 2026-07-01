// Sienna opening quote — verbatim port of <div.quote-wrap> from the Katsudoto
// "syakira" template. The single English caption line is replaced by the couple's
// quote text, falling back to the template's original line when unset. No arabic /
// source / ornaments in this theme's quote (unlike ivory) — just one caption
// paragraph. Always renders (fallback copy). data-aos timing kept verbatim.

import type { InvitationView } from "@/server/queries/invitation";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
};

const FALLBACK_QUOTE =
  "Neither of us ever imagined that the person we had been waiting for had been there all along";

export function SiennaQuote({ data }: Props) {
  const quote = data.sections.pasangan.quote;
  const text = quote?.text?.trim() || FALLBACK_QUOTE;

  return (
    <div className="quote-wrap" data-section-order="quote">
      <p className="quote-caption" data-aos="fade-up" data-aos-duration="1200">
        {text}
      </p>
    </div>
  );
}
