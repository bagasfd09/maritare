// Money is stored as integer rupiah (no decimals) per project convention.
export function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// Compact display form for dashboards: 42_800_000 → "Rp 42,8jt", 300_000 → "Rp 300rb".
export function rupiahShort(n: number) {
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(".", ",") + "jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + "rb";
  return "Rp " + n;
}
