// Minimal ZIP archive writer using the STORE method (no compression).
// Produces a valid `.zip` openable by Windows Explorer, Excel, and macOS.
//
// Dependency-free; uses only TextEncoder / Uint8Array / DataView, which are
// available in both Node and the browser. Output is fully deterministic
// (no Date.now() / new Date()): DOS date/time are fixed constants.
//
// ZIP file layout produced here (in order):
//   [ Local File Header + filename + stored data ]  (one block per file)
//   [ Central Directory Header ]                     (one record per file)
//   [ End Of Central Directory record ]              (exactly one)

// ---------------------------------------------------------------------------
// CRC-32 (polynomial 0xEDB88320), with a precomputed lookup table.
// ---------------------------------------------------------------------------

const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Fixed constants.
// ---------------------------------------------------------------------------

// DOS date/time fixed to 1980-01-01 00:00:00 (the ZIP epoch), for determinism.
// DOS date packing:  bits 0-4 day (1-31), 5-8 month (1-12), 9-15 year-1980.
//   1980-01-01 => year 0, month 1, day 1 => (0 << 9) | (1 << 5) | 1 = 0x0021.
// DOS time packing:  bits 0-4 second/2, 5-10 minute, 11-15 hour.
//   00:00:00 => 0x0000.
const DOS_DATE = 0x0021;
const DOS_TIME = 0x0000;

// Version needed to extract: 2.0 (20) is the standard value for stored entries.
const VERSION_NEEDED = 20;
// Version made by: 2.0 in the low byte; high byte (host OS) left as 0 (MS-DOS).
const VERSION_MADE_BY = 20;

// General Purpose Bit Flag: bit 11 (0x0800) marks filename/content as UTF-8.
const GP_FLAG_UTF8 = 0x0800;

// Compression method 0 == STORE (no compression).
const METHOD_STORE = 0;

// Record signatures (all stored little-endian).
const SIG_LOCAL = 0x04034b50; // "PK\x03\x04"  Local File Header
const SIG_CENTRAL = 0x02014b50; // "PK\x01\x02"  Central Directory Header
const SIG_EOCD = 0x06054b50; // "PK\x05\x06"  End Of Central Directory

// ---------------------------------------------------------------------------
// Byte buffer writer (little-endian helpers).
// ---------------------------------------------------------------------------

class ByteWriter {
  private chunks: Uint8Array[] = [];
  private length = 0;

  get offset(): number {
    return this.length;
  }

  bytes(b: Uint8Array): void {
    this.chunks.push(b);
    this.length += b.length;
  }

  u16(value: number): void {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, value & 0xffff, true /* little-endian */);
    this.bytes(b);
  }

  u32(value: number): void {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, value >>> 0, true /* little-endian */);
    this.bytes(b);
  }

  concat(): Uint8Array<ArrayBuffer> {
    const out = new Uint8Array(this.length);
    let pos = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, pos);
      pos += chunk.length;
    }
    return out;
  }
}

// Per-file metadata captured while writing local headers, needed later for the
// central directory.
interface EntryMeta {
  nameBytes: Uint8Array;
  crc: number;
  size: number; // compressed size == uncompressed size (STORE)
  localHeaderOffset: number; // byte offset of this entry's local header
}

/**
 * Create a ZIP archive (STORE method) from the given files.
 *
 * Each file's `name` and `content` are encoded as UTF-8. The returned bytes are
 * a complete, valid `.zip` file.
 */
export function createZip(files: { name: string; content: string }[]): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const writer = new ByteWriter();
  const entries: EntryMeta[] = [];

  // --- Local File Headers + stored data ---------------------------------
  // Local File Header layout (30 bytes fixed + variable name + data):
  //   off 0  u32  signature            0x04034b50
  //   off 4  u16  version needed       20
  //   off 6  u16  general purpose flag  0x0800 (UTF-8)
  //   off 8  u16  compression method    0 (store)
  //   off 10 u16  last mod file time    DOS_TIME
  //   off 12 u16  last mod file date    DOS_DATE
  //   off 14 u32  crc-32                crc(content)
  //   off 18 u32  compressed size       content byte length
  //   off 22 u32  uncompressed size     content byte length
  //   off 26 u16  file name length      nameBytes.length
  //   off 28 u16  extra field length    0
  //   off 30      file name (nameBytes)
  //   ...         file data (contentBytes)
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = encoder.encode(file.content);
    const crc = crc32(contentBytes);
    const size = contentBytes.length;
    const localHeaderOffset = writer.offset;

    writer.u32(SIG_LOCAL); // signature
    writer.u16(VERSION_NEEDED); // version needed to extract
    writer.u16(GP_FLAG_UTF8); // general purpose bit flag (UTF-8)
    writer.u16(METHOD_STORE); // compression method
    writer.u16(DOS_TIME); // last mod file time
    writer.u16(DOS_DATE); // last mod file date
    writer.u32(crc); // crc-32
    writer.u32(size); // compressed size
    writer.u32(size); // uncompressed size
    writer.u16(nameBytes.length); // file name length
    writer.u16(0); // extra field length
    writer.bytes(nameBytes); // file name
    writer.bytes(contentBytes); // file data (stored verbatim)

    entries.push({ nameBytes, crc, size, localHeaderOffset });
  }

  // --- Central Directory -------------------------------------------------
  // Central Directory Header layout (46 bytes fixed + variable name):
  //   off 0  u32  signature              0x02014b50
  //   off 4  u16  version made by        20
  //   off 6  u16  version needed         20
  //   off 8  u16  general purpose flag    0x0800 (UTF-8)
  //   off 10 u16  compression method      0 (store)
  //   off 12 u16  last mod file time      DOS_TIME
  //   off 14 u16  last mod file date      DOS_DATE
  //   off 16 u32  crc-32                  crc(content)
  //   off 20 u32  compressed size         content byte length
  //   off 24 u32  uncompressed size       content byte length
  //   off 28 u16  file name length        nameBytes.length
  //   off 30 u16  extra field length      0
  //   off 32 u16  file comment length     0
  //   off 34 u16  disk number start       0
  //   off 36 u16  internal file attrs     0
  //   off 38 u32  external file attrs     0
  //   off 42 u32  relative offset of local header
  //   off 46      file name (nameBytes)
  const centralDirStart = writer.offset;

  for (const entry of entries) {
    writer.u32(SIG_CENTRAL); // signature
    writer.u16(VERSION_MADE_BY); // version made by
    writer.u16(VERSION_NEEDED); // version needed to extract
    writer.u16(GP_FLAG_UTF8); // general purpose bit flag (UTF-8)
    writer.u16(METHOD_STORE); // compression method
    writer.u16(DOS_TIME); // last mod file time
    writer.u16(DOS_DATE); // last mod file date
    writer.u32(entry.crc); // crc-32
    writer.u32(entry.size); // compressed size
    writer.u32(entry.size); // uncompressed size
    writer.u16(entry.nameBytes.length); // file name length
    writer.u16(0); // extra field length
    writer.u16(0); // file comment length
    writer.u16(0); // disk number start
    writer.u16(0); // internal file attributes
    writer.u32(0); // external file attributes
    writer.u32(entry.localHeaderOffset); // relative offset of local header
    writer.bytes(entry.nameBytes); // file name
  }

  const centralDirSize = writer.offset - centralDirStart;

  // --- End Of Central Directory record -----------------------------------
  // EOCD layout (22 bytes fixed, no archive comment):
  //   off 0  u32  signature                       0x06054b50
  //   off 4  u16  number of this disk             0
  //   off 6  u16  disk with start of central dir  0
  //   off 8  u16  central dir records on this disk count
  //   off 10 u16  total central dir records       count
  //   off 12 u32  size of central directory       centralDirSize
  //   off 16 u32  offset of central dir start     centralDirStart
  //   off 20 u16  archive comment length          0
  writer.u32(SIG_EOCD); // signature
  writer.u16(0); // number of this disk
  writer.u16(0); // disk where central directory starts
  writer.u16(entries.length); // central dir records on this disk
  writer.u16(entries.length); // total central dir records
  writer.u32(centralDirSize); // size of central directory
  writer.u32(centralDirStart); // offset of central directory start
  writer.u16(0); // archive comment length

  return writer.concat();
}
