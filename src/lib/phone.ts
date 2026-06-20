// Indonesian phone-number normalization to international digits (no "+"), for
// wa.me links and the Fonnte API. "0812-3456-7890" / "+62 812..." / "812..."
// all become "62812...". Returns null when nothing usable remains.

export function normalizePhoneIntl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Keep digits only (drop +, spaces, dashes, parens).
  let d = raw.replace(/\D/g, "");
  if (!d) return null;

  if (d.startsWith("0")) {
    d = "62" + d.slice(1); // local 08xx → 628xx
  } else if (d.startsWith("8")) {
    d = "62" + d; // bare 8xx → 628xx
  }
  // Collapse a stray "620…" (from "+62 08…") down to "62…".
  if (d.startsWith("620")) {
    d = "62" + d.slice(3);
  }

  // Sanity bounds for an MSISDN.
  if (d.length < 9 || d.length > 15) return null;
  return d;
}

/**
 * Live display formatter for a phone input (as-you-type). Indonesian-first:
 * a leading "0" or bare "8…" becomes "+62 …", grouped "+62 812-3456-7890".
 * Other country codes fall back to "+<digits>" in groups of 4. Empty → "".
 * Pairs with normalizePhoneIntl() for storage/sending (which strips formatting).
 */
export function formatPhoneId(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) {
    // Preserve a lone leading "+" the user just typed.
    return raw.trimStart().startsWith("+") ? "+" : "";
  }

  // Canonicalize Indonesian local forms to a 62 country code.
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  if (digits.startsWith("620")) digits = "62" + digits.slice(3);

  if (digits.startsWith("62")) {
    const national = digits.slice(2, 2 + 13); // cap overall length
    if (!national) return "+62";
    const parts: string[] = [national.slice(0, 3)];
    for (let i = 3; i < national.length; i += 4) {
      parts.push(national.slice(i, i + 4));
    }
    return "+62 " + parts.filter(Boolean).join("-");
  }

  // Non-Indonesian / unknown: keep "+<digits>" grouped in 4s.
  const capped = digits.slice(0, 15);
  const groups: string[] = [];
  for (let i = 0; i < capped.length; i += 4) groups.push(capped.slice(i, i + 4));
  return "+" + groups.join(" ");
}
