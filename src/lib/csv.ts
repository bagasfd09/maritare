// Minimal RFC-4180-ish CSV parser + serializer.
// Dependency-free, runs in both Node and the browser (no Node-only imports).
// Callers are responsible for trimming individual cell whitespace — the parser
// preserves cell content verbatim (apart from quote-unescaping).

const QUOTE = '"';
const COMMA = ",";
const CR = "\r";
const LF = "\n";

/**
 * Parse CSV text into an array of rows, each an array of string cells.
 *
 * Behavior:
 * - Strips a leading UTF-8 BOM (U+FEFF) if present.
 * - Supports double-quote-quoted fields. Inside a quoted field, `""` is a
 *   literal quote, and `,` / CR / LF are treated as literal data.
 * - Accepts both `\r\n` and `\n` line endings (a lone `\r` outside quotes is
 *   also treated as a line break, for robustness).
 * - Ignores a single final trailing empty line.
 * - Returns `[]` for completely empty input.
 * - Tolerates ragged rows (rows may have differing cell counts).
 */
export function parseCsv(text: string): string[][] {
  // Strip a leading UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  if (text.length === 0) {
    return [];
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // Tracks whether the current field/row has actually started, so we can
  // distinguish a genuine final trailing empty line from real data.
  let i = 0;

  const endField = (): void => {
    row.push(field);
    field = "";
  };

  const endRow = (): void => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === QUOTE) {
        // A quote inside a quoted field: either an escaped quote ("") or the
        // closing quote of the field.
        if (text[i + 1] === QUOTE) {
          field += QUOTE;
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      // Any other character (including , CR LF) is literal inside quotes.
      field += ch;
      i += 1;
      continue;
    }

    // Not inside quotes.
    if (ch === QUOTE) {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === COMMA) {
      endField();
      i += 1;
      continue;
    }

    if (ch === CR) {
      // Handle CRLF as a single line break; a lone CR also ends the row.
      endRow();
      if (text[i + 1] === LF) {
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (ch === LF) {
      endRow();
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  // Flush the trailing field/row. If the input ended exactly on a line break,
  // `field` is "" and `row` is empty — that represents a final trailing empty
  // line, which we ignore. Otherwise flush the in-progress row.
  if (field.length > 0 || row.length > 0) {
    endRow();
  }

  return rows;
}

/**
 * Determine whether a cell must be quoted per RFC 4180: it contains a comma,
 * a double-quote, a CR, or an LF.
 */
function needsQuoting(cell: string): boolean {
  return (
    cell.includes(COMMA) ||
    cell.includes(QUOTE) ||
    cell.includes(CR) ||
    cell.includes(LF)
  );
}

/**
 * Serialize rows to CSV text.
 *
 * - A cell is wrapped in double-quotes (with internal quotes doubled) ONLY if
 *   it contains a comma, double-quote, CR, or LF; otherwise it is emitted raw.
 * - Cells are joined with `,` and rows with `\r\n` (Excel-friendly).
 * - No trailing newline is added.
 */
export function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) =>
          needsQuoting(cell)
            ? QUOTE + cell.split(QUOTE).join(QUOTE + QUOTE) + QUOTE
            : cell,
        )
        .join(COMMA),
    )
    .join(CR + LF);
}
