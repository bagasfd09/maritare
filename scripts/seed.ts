// Seed script for the Maritare dev database.
//
// Run with:  node --env-file=.env.local scripts/seed.ts
//
// Constraints (Node 24 native TS type-stripping):
//   - relative imports only (no path aliases, no tsx)
//   - only erasable TS syntax (no enums / namespaces / parameter properties)
//   - we build our own pg Pool from process.env.DATABASE_URL
//
// Idempotent: safe to re-run. Records are matched by their natural unique
// keys (user email, package/template slug, wedding slug, order invoiceNo) and
// upserted via onConflictDoUpdate / onConflictDoNothing. Child rows (guests,
// wishes) are reset for the main wedding on each run so the seed converges to
// a known state instead of accumulating duplicates.

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, isNull, notInArray } from "drizzle-orm";
import {
  users,
  packages,
  templates,
  weddings,
  guests,
  wishes,
  orders,
} from "../src/lib/db/schema.ts";
import type { TemplateManifest } from "../src/lib/invitation/manifest.ts";
import { FOLK_MANIFEST, IVORY_MANIFEST, SCARLET_MANIFEST, SIENNA_MANIFEST, PLUM_MANIFEST } from "../src/lib/invitation/manifest.ts";
import { hashPassword } from "../src/lib/password.ts";

// Enum literal unions, kept in sync with src/lib/db/schema.ts pgEnum defs.
// Declared here so the inline seed arrays narrow to the exact column types
// (a bare string literal would otherwise widen to `string`).
type GuestSide = "groom" | "bride" | "both";
type GuestStatus = "pending" | "confirmed" | "declined";
type InvitationStatus = "none" | "sent" | "opened";
type WeddingStatus = "draft" | "pending" | "live" | "expired";
type TemplateStatus = "draft" | "published";
type WishStatus = "pending" | "approved" | "hidden";
type OrderStatus = "pending" | "paid" | "failed" | "refunded";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (run with node --env-file=.env.local)");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool, {
  schema: { users, packages, templates, weddings, guests, wishes, orders },
});

// ─────────────────────────────────────────────────────────────────
// Source data (ported from the repo's mock data — see task brief).
// ─────────────────────────────────────────────────────────────────

// src/lib/admin-data.ts → PACKAGES
const PACKAGE_SEED = [
  {
    slug: "silver",
    name: "Silver",
    price: 150_000,
    durationDays: 90,
    guestLimit: 100,
    photoLimit: 30,
    guestbookLimit: 1,
    tagline: "Untuk acara intimate",
    perks: ["1 template editorial", "30 foto gallery", "RSVP & buku tamu", "Background music"],
    featured: false,
    active: true,
    sortOrder: 0,
  },
  {
    slug: "gold",
    name: "Gold",
    price: 300_000,
    durationDays: 180,
    guestLimit: 300,
    photoLimit: null,
    guestbookLimit: 3,
    tagline: "Paling banyak dipilih",
    perks: ["Semua fitur Silver", "Custom subdomain", "Livestream embed", "QR check-in & export"],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    slug: "platinum",
    name: "Platinum",
    price: 500_000,
    durationDays: 365,
    guestLimit: null, // -1 in source = unlimited
    photoLimit: null,
    guestbookLimit: 5,
    tagline: "Untuk pernikahan besar",
    perks: ["Semua fitur Gold", "Custom domain (.com/.id)", "Tamu unlimited", "Konsultasi desain 1-on-1"],
    featured: false,
    active: true,
    sortOrder: 2,
  },
];

// src/lib/admin-data.ts → ADMIN_TEMPLATES
// Only Folk + Scarlet are offered now. All other catalog templates are retired
// (soft-deleted in run() below). Each carries its manifest (form groups + photo
// slots) so the editor + renderer are driven by the DB.
const TEMPLATE_SEED: {
  slug: string;
  name: string;
  style: string;
  category: string;
  palette: string[];
  status: TemplateStatus;
  featured: boolean;
  isNew: boolean;
  manifest: TemplateManifest;
}[] = [
  // Renderable illustrated folk template (src/components/invitation/folk/).
  { slug: "folk", name: "Folk Garden", style: "Illustrated Folk", category: "Rustic", palette: ["#9E2B62", "#52602F", "#E8A33D"], status: "published", featured: true, isNew: true, manifest: FOLK_MANIFEST },
  // Renderable editorial serif template (src/components/invitation/scarlet/).
  { slug: "scarlet", name: "Scarlet Editorial", style: "Editorial Serif", category: "Minimal", palette: ["#7C2D2D", "#FAF6F1", "#1A1A1A"], status: "published", featured: false, isNew: true, manifest: SCARLET_MANIFEST },
  // Renderable romantic floral template — Katsudoto "Aulia" port (src/components/invitation/ivory/).
  { slug: "ivory", name: "Ivory", style: "Romantic Floral", category: "Romantic", palette: ["#FBF7EC", "#D89BAE", "#7C8B5A"], status: "published", featured: false, isNew: true, manifest: IVORY_MANIFEST },
  // Renderable warm botanical template — Katsudoto "Syakira" port (src/components/invitation/sienna/).
  { slug: "sienna", name: "Sienna", style: "Warm Botanical", category: "Romantic", palette: ["#FBF6F0", "#D6A191", "#CB3A31"], status: "published", featured: false, isNew: true, manifest: SIENNA_MANIFEST },
  // Renderable plum/forest botanical template — Katsudoto "Kinanti" port (src/components/invitation/plum/).
  { slug: "plum", name: "Plum", style: "Forest Botanical", category: "Romantic", palette: ["#F3E4D8", "#613947", "#D0A25E"], status: "published", featured: false, isNew: true, manifest: PLUM_MANIFEST },
];

// Slugs to retire (soft-delete) — everything that is no longer offered.
const KEEP_TEMPLATE_SLUGS = ["folk", "scarlet", "ivory", "sienna", "plum"];

// src/components/templates/guests.tsx → GUESTS (the 8-guest array)
// side: P = bride, A = groom, — = both. inv: sent | opened.
const GUEST_SEED: {
  name: string;
  group: string;
  phone: string;
  status: GuestStatus;
  count: number | null;
  food: string | null;
  side: GuestSide;
  inv: InvitationStatus;
}[] = [
  { name: "Sari Wijaya", group: "Keluarga Mempelai Wanita", phone: "+62 812-3456-7890", status: "confirmed", count: 2, food: "Vegetarian", side: "bride", inv: "sent" },
  { name: "Bayu Pratama", group: "Teman SMA Andi", phone: "+62 813-9876-5432", status: "confirmed", count: 1, food: "Reguler", side: "groom", inv: "opened" },
  { name: "Maya Lestari", group: "Kantor Putri", phone: "+62 815-2468-1357", status: "pending", count: null, food: null, side: "bride", inv: "opened" },
  { name: "Reza Hartono", group: "Keluarga Mempelai Pria", phone: "+62 811-1234-5678", status: "confirmed", count: 4, food: "Reguler", side: "groom", inv: "sent" },
  { name: "Iqbal & Sari", group: "Sahabat Pasangan", phone: "+62 819-7654-3210", status: "declined", count: 0, food: null, side: "both", inv: "opened" },
  { name: "Tiara Maharani", group: "Teman Kuliah Putri", phone: "+62 812-1111-2222", status: "confirmed", count: 2, food: "Halal", side: "bride", inv: "opened" },
  { name: "Galih Setiawan", group: "Keluarga Mempelai Pria", phone: "+62 813-3333-4444", status: "pending", count: null, food: null, side: "groom", inv: "sent" },
  { name: "Dina Permata", group: "Sahabat Pasangan", phone: "+62 814-5555-6666", status: "confirmed", count: 1, food: "Reguler", side: "both", inv: "opened" },
];

// src/components/templates/wishes.tsx → WISHES_FULL
// status: approved | pending; pinned where flagged.
const WISH_SEED: {
  fromName: string;
  body: string;
  attending: boolean | null;
  status: WishStatus;
  pinned: boolean;
}[] = [
  { fromName: "Reza Hartono & Keluarga", body: "Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah. Barakallahu lakuma wa baraka 'alaykuma, wa jama'a baynakuma fi khair.", attending: true, status: "pending", pinned: false },
  { fromName: "Tante Dewi", body: "Akhirnya ya nak! Tante ikut bahagia sekali. Sampai jumpa di Pendopo Kayon ❀", attending: true, status: "approved", pinned: true },
  { fromName: "Bayu (SMA 5)", body: "Bro, akhirnya kawin juga lo wkwk. Congrats banget, see you di hari H! Inget janji nraktir nasi padang ya.", attending: true, status: "approved", pinned: false },
  { fromName: "Maya Lestari", body: "Selamat ya Put! Maaf belum bisa konfirmasi pasti, tapi insyaallah usaha datang.", attending: false, status: "approved", pinned: false },
  { fromName: "Sari & Iqbal", body: "Selamat untuk pasangan paling lucu yang pernah kita kenal! Doakan ya kami juga nyusul tahun depan 🤍", attending: true, status: "approved", pinned: false },
  { fromName: "Anonim", body: "Selamat untuk kalian berdua, semoga rumah tangga kalian dipenuhi cinta dan kasih sayang.", attending: null, status: "pending", pinned: false },
  { fromName: "Tiara Maharani", body: "Putri, kamu memang yang paling deserving! Andi, jaga sahabatku baik-baik ya. See you di Yogya!", attending: true, status: "approved", pinned: false },
];

// src/components/molecules/editor-canvas.tsx → "Our Story" (cerita) content,
// plus the editor-section-rail marks pasangan + acara + cerita as done.
const CERITA_BODY =
  "Kami bertemu di sebuah sore di kafe sederhana di Jalan Prawirotaman — Kiki sedang membaca buku " +
  "Pramoedya, dan Bagas datang dengan pertanyaan tentang halaman yang sedang ia baca.\n\n" +
  "Dari obrolan tentang buku, kami berlanjut ke perjalanan kecil ke pasar-pasar lama, lalu jadi cerita " +
  "yang tak ingin kami akhiri…";

// ── Default-template demo content ──────────────────────────────────
// Generic "Groom"/"Bride" with TODAY's date and randomized parents / venues /
// addresses, so the seeded template reads as a neutral placeholder rather than a
// specific couple. (Math.random / new Date() are fine in this Node seed script.)
function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
const TODAY = new Date().toISOString().slice(0, 10);
const MALE_NAMES = ["Surya Pratama", "Bambang Wijaya", "Hendra Gunawan", "Agus Santoso", "Joko Nugroho", "Eko Prasetyo", "Dedi Kurniawan"];
const FEMALE_NAMES = ["Ratna Dewi", "Sri Lestari", "Endang Wahyuni", "Tuti Hapsari", "Nani Suryani", "Wati Anggraini", "Yuni Astuti"];
const AKAD_VENUES = ["Masjid Agung Al-Falah", "Masjid Raya Baiturrahman", "Kediaman Mempelai Wanita", "Masjid Jami' An-Nur"];
const RESEPSI_VENUES = ["Ballroom Hotel Tentrem", "Graha Saba Buana", "Pendopo Ndalem Wijaya", "Gedung Serbaguna Mandala", "Balai Kartini"];
const CITIES = ["Yogyakarta", "Jakarta", "Bandung", "Surabaya", "Semarang", "Solo"];
const STREETS = ["Jl. Diponegoro No. 27", "Jl. Malioboro No. 12", "Jl. Sudirman No. 45", "Jl. Gajah Mada No. 8", "Jl. Ahmad Yani No. 100"];
const CHILD_ORDER_M = ["Putra pertama dari", "Putra kedua dari", "Putra ketiga dari", "Putra bungsu dari"];
const CHILD_ORDER_F = ["Putri pertama dari", "Putri kedua dari", "Putri ketiga dari", "Putri bungsu dari"];

const demoCity = pick(CITIES);
const demoAkadVenue = pick(AKAD_VENUES);
const demoResepsiVenue = pick(RESEPSI_VENUES);
const demoAkadAddr = `${pick(STREETS)}, ${demoCity}`;
const demoResepsiAddr = `${pick(STREETS)}, ${demoCity}`;
const mapsUrl = (venue: string) =>
  `https://maps.google.com/?q=${encodeURIComponent(`${venue} ${demoCity}`)}`;

// Section `data` payloads follow src/lib/invitation/sections.ts contracts.
const MAIN_SECTIONS = {
  pasangan: {
    title: "Pasangan",
    done: true,
    data: {
      groom: {
        fullName: "Groom",
        fatherName: pick(MALE_NAMES),
        motherName: pick(FEMALE_NAMES),
        childOrder: pick(CHILD_ORDER_M),
        instagram: "groom",
      },
      bride: {
        fullName: "Bride",
        fatherName: pick(MALE_NAMES),
        motherName: pick(FEMALE_NAMES),
        childOrder: pick(CHILD_ORDER_F),
        instagram: "bride",
      },
      quote: {
        text:
          "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
        source: "Q.S. Ar-Rum: 21",
      },
    },
  },
  acara: {
    title: "Acara",
    done: true,
    data: {
      events: [
        {
          name: "Akad Nikah",
          date: TODAY,
          timeStart: "08:00",
          timeEnd: "10:00",
          venue: demoAkadVenue,
          address: demoAkadAddr,
          mapsUrl: mapsUrl(demoAkadVenue),
        },
        {
          name: "Resepsi",
          date: TODAY,
          timeStart: "11:00",
          timeEnd: "14:00",
          venue: demoResepsiVenue,
          address: demoResepsiAddr,
          mapsUrl: mapsUrl(demoResepsiVenue),
        },
      ],
    },
  },
  cerita: { title: "Bagaimana kami bertemu", body: CERITA_BODY, done: true },
  galeri: { done: false },
  amplop: {
    done: true,
    data: {
      accounts: [{ bank: "BCA", number: "1234567890", holder: "Bride" }],
      ewallets: [{ provider: "GoPay", number: "081234567890", holder: "Groom" }],
    },
  },
  musik: { done: true, data: { enabled: true, track: "flora-theme" } },
  rsvp: { done: true, data: { enabled: true, deadline: TODAY, maxPartySize: 2 } },
};

// Extra weddings for admin realism (src/lib/admin-data.ts → WEDDINGS list).
// The "Andi & Putri" row is the main wedding seeded separately. We attach
// each extra wedding to a synthetic customer user keyed by the row's email.
// Template names mapped to template slugs; statuses are already enum-valid.
const EXTRA_WEDDINGS: {
  couple: string;
  slug: string;
  groom: string;
  bride: string;
  pkg: string;
  status: WeddingStatus;
  eventDate: string | null;
  venue: string | null;
  city: string;
  template: string;
  customerEmail: string;
  customerName: string;
  paid: number;
}[] = [
  // maya-reza is the LIVE fixture for the public /inv route → uses scarlet (renderable).
  { couple: "Maya & Reza", slug: "maya-reza", groom: "Reza", bride: "Maya", pkg: "platinum", status: "live", eventDate: "2026-08-22", venue: "Balai Kartini", city: "Jakarta", template: "scarlet", customerEmail: "maya.lestari@gmail.com", customerName: "Maya Lestari", paid: 500_000 },
  { couple: "Dina & Bayu", slug: "dina-bayu", groom: "Bayu", bride: "Dina", pkg: "silver", status: "draft", eventDate: "2026-09-05", venue: null, city: "Bandung", template: "folk", customerEmail: "dina.permata@gmail.com", customerName: "Dina Permata", paid: 150_000 },
  { couple: "Sari & Iqbal", slug: "sari-iqbal", groom: "Iqbal", bride: "Sari", pkg: "gold", status: "live", eventDate: "2026-07-30", venue: null, city: "Surabaya", template: "scarlet", customerEmail: "iqbal.h@gmail.com", customerName: "Iqbal Hidayat", paid: 300_000 },
  { couple: "Tiara & Galih", slug: "tiara-galih", groom: "Galih", bride: "Tiara", pkg: "silver", status: "expired", eventDate: "2026-02-12", venue: null, city: "Yogyakarta", template: "folk", customerEmail: "tiara.m@gmail.com", customerName: "Tiara Maharani", paid: 150_000 },
  { couple: "Lisa & Ferdy", slug: "lisa-ferdy", groom: "Ferdy", bride: "Lisa", pkg: "platinum", status: "live", eventDate: "2026-10-18", venue: null, city: "Bali", template: "scarlet", customerEmail: "lisa.k@gmail.com", customerName: "Lisa Kurniawan", paid: 500_000 },
  { couple: "Nadia & Arman", slug: "nadia-arman", groom: "Arman", bride: "Nadia", pkg: "gold", status: "draft", eventDate: null, venue: null, city: "Medan", template: "folk", customerEmail: "nadia.s@gmail.com", customerName: "Nadia Salsabila", paid: 0 },
  { couple: "Anggi & Dimas", slug: "anggi-dimas", groom: "Dimas", bride: "Anggi", pkg: "silver", status: "pending", eventDate: "2026-11-08", venue: null, city: "Bandung", template: "scarlet", customerEmail: "anggi.p@gmail.com", customerName: "Anggi Pertiwi", paid: 0 },
];

// src/lib/admin-data.ts → TRANSACTIONS. couple links order → wedding;
// pkg (e.g. "Gold (extend)") is normalised to a package slug; time strings
// are descriptive only and not stored.
const TRANSACTION_SEED: {
  invoiceNo: string;
  customerEmail: string;
  customerName: string;
  weddingSlug: string | null;
  pkg: string;
  description: string;
  amount: number;
  method: string;
  status: OrderStatus;
}[] = [
  { invoiceNo: "MTR-2026-0287", customerEmail: "lisa.k@gmail.com", customerName: "Lisa Kurniawan", weddingSlug: "lisa-ferdy", pkg: "platinum", description: "Platinum", amount: 500_000, method: "Midtrans · BCA VA", status: "paid" },
  { invoiceNo: "MTR-2026-0286", customerEmail: "andi.pratama@gmail.com", customerName: "Andi Pratama", weddingSlug: "andi-putri", pkg: "gold", description: "Gold (extend)", amount: 200_000, method: "Midtrans · GoPay", status: "paid" },
  { invoiceNo: "MTR-2026-0285", customerEmail: "nadia.s@gmail.com", customerName: "Nadia Salsabila", weddingSlug: "nadia-arman", pkg: "gold", description: "Gold", amount: 300_000, method: "Manual · Mandiri", status: "pending" },
  { invoiceNo: "MTR-2026-0284", customerEmail: "dina.permata@gmail.com", customerName: "Dina Permata", weddingSlug: "dina-bayu", pkg: "silver", description: "Silver", amount: 150_000, method: "Midtrans · BCA VA", status: "paid" },
  { invoiceNo: "MTR-2026-0283", customerEmail: "anggi.p@gmail.com", customerName: "Anggi Pertiwi", weddingSlug: "anggi-dimas", pkg: "silver", description: "Silver", amount: 150_000, method: "Midtrans · OVO", status: "failed" },
  { invoiceNo: "MTR-2026-0282", customerEmail: "rizki.p@gmail.com", customerName: "Rizki Putra", weddingSlug: null, pkg: "gold", description: "Gold · Rizki & Wati", amount: 300_000, method: "Midtrans · BCA VA", status: "refunded" },
  { invoiceNo: "MTR-2026-0281", customerEmail: "yuni.k@gmail.com", customerName: "Yuni Kartika", weddingSlug: null, pkg: "platinum", description: "Platinum · Yuni & Hadi", amount: 500_000, method: "Manual · BCA", status: "paid" },
];

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

async function upsertUser(input: typeof users.$inferInsert) {
  const [row] = await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: input.name,
        role: input.role,
        updatedAt: new Date(),
        // Keep the seeded password in sync on re-runs (only when provided).
        ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
        ...(input.adminRole ? { adminRole: input.adminRole } : {}),
      },
    })
    .returning();
  return row;
}

async function upsertPackageBySlug(input: typeof packages.$inferInsert) {
  const [row] = await db
    .insert(packages)
    .values(input)
    .onConflictDoUpdate({
      target: packages.slug,
      set: {
        name: input.name,
        price: input.price,
        durationDays: input.durationDays,
        guestLimit: input.guestLimit,
        photoLimit: input.photoLimit,
        guestbookLimit: input.guestbookLimit,
        tagline: input.tagline,
        perks: input.perks,
        featured: input.featured,
        active: input.active,
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

async function upsertTemplateBySlug(input: typeof templates.$inferInsert) {
  const [row] = await db
    .insert(templates)
    .values(input)
    .onConflictDoUpdate({
      target: templates.slug,
      set: {
        name: input.name,
        style: input.style,
        category: input.category,
        palette: input.palette,
        status: input.status,
        featured: input.featured,
        isNew: input.isNew,
        manifest: input.manifest,
        // Re-seeding an offered template clears any prior soft-delete.
        deletedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

async function upsertWeddingBySlug(input: typeof weddings.$inferInsert) {
  const [row] = await db
    .insert(weddings)
    .values(input)
    .onConflictDoUpdate({
      target: weddings.slug,
      set: {
        userId: input.userId,
        groomName: input.groomName,
        brideName: input.brideName,
        eventDate: input.eventDate,
        venue: input.venue,
        city: input.city,
        templateId: input.templateId,
        packageId: input.packageId,
        status: input.status,
        sections: input.sections,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

async function upsertOrderByInvoice(input: typeof orders.$inferInsert) {
  const [row] = await db
    .insert(orders)
    .values(input)
    .onConflictDoUpdate({
      target: orders.invoiceNo,
      set: {
        userId: input.userId,
        weddingId: input.weddingId,
        packageId: input.packageId,
        description: input.description,
        amount: input.amount,
        method: input.method,
        status: input.status,
        paidAt: input.paidAt,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

// ─────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────

async function seed() {
  const summary: Record<string, number> = {};

  // 1. Catalog: packages + templates
  const packageBySlug = new Map();
  for (const p of PACKAGE_SEED) {
    const row = await upsertPackageBySlug(p);
    packageBySlug.set(p.slug, row);
  }
  summary.packages = packageBySlug.size;

  const templateBySlug = new Map();
  for (const t of TEMPLATE_SEED) {
    const row = await upsertTemplateBySlug(t);
    templateBySlug.set(t.slug, row);
  }
  // Retire every other catalog template via soft-delete (preserves FK integrity
  // for any wedding still pointing at one; queries filter on isNull(deletedAt)).
  await db
    .update(templates)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(notInArray(templates.slug, KEEP_TEMPLATE_SLUGS), isNull(templates.deletedAt)));
  summary.templates = templateBySlug.size;

  // 2. Core users
  const andi = await upsertUser({
    name: "Andi Pratama",
    email: "andi.pratama@gmail.com",
    role: "customer",
    emailVerified: new Date(),
  });
  const rina = await upsertUser({
    name: "Rina Pratama",
    email: "rina@maritare.id",
    role: "admin",
    adminRole: "super_admin",
    emailVerified: new Date(),
  });
  // Email+password admin login (dev default). Password is scrypt-hashed; the
  // plaintext below is a dev convenience only — change it before production.
  const adminMaritare = await upsertUser({
    name: "Admin Maritare",
    email: "admin@maritare.id",
    role: "admin",
    adminRole: "super_admin",
    emailVerified: new Date(),
    passwordHash: await hashPassword("devvMaritare@26"),
  });

  // Synthetic customer users for the extra/admin-realism weddings + orders.
  const userByEmail = new Map();
  userByEmail.set(andi.email, andi);
  userByEmail.set(rina.email, rina);
  userByEmail.set(adminMaritare.email, adminMaritare);

  const extraCustomers = [
    ...EXTRA_WEDDINGS.map((w) => ({ email: w.customerEmail, name: w.customerName })),
    ...TRANSACTION_SEED.map((t) => ({ email: t.customerEmail, name: t.customerName })),
  ];
  for (const c of extraCustomers) {
    if (userByEmail.has(c.email)) continue;
    const row = await upsertUser({ name: c.name, email: c.email, role: "customer" });
    userByEmail.set(row.email, row);
  }
  summary.users = userByEmail.size;

  // Backfill: every admin (incl. real Google logins like bagasfd09) gets a
  // default sub-role of super_admin if none is set yet.
  await db
    .update(users)
    .set({ adminRole: "super_admin", updatedAt: new Date() })
    .where(and(eq(users.role, "admin"), isNull(users.adminRole)));

  // 3. Main wedding: andi-putri
  // The demo wedding belongs to the developer's real login when that account
  // exists (it was transferred on 2026-06-13); re-seeding must not steal it
  // back to the synthetic demo user.
  const OWNER_EMAIL = "mbgsfadillah09@gmail.com";
  const realOwner = await db.query.users.findFirst({
    columns: { id: true },
    where: eq(users.email, OWNER_EMAIL),
  });
  // Main wedding uses a UUID slug (preview links shouldn't expose a readable
  // slug yet). Migrate any legacy "andi-putri" row to it so re-seeds stay
  // idempotent (the upsert below keys on this slug).
  const MAIN_WEDDING_SLUG = "08b432d2-ece2-4289-b56b-b8cd06485e54";
  await db
    .update(weddings)
    .set({ slug: MAIN_WEDDING_SLUG, updatedAt: new Date() })
    .where(eq(weddings.slug, "andi-putri"));

  const scarlet = templateBySlug.get("scarlet");
  const gold = packageBySlug.get("gold");
  const mainWedding = await upsertWeddingBySlug({
    userId: realOwner ? realOwner.id : andi.id,
    slug: MAIN_WEDDING_SLUG,
    groomName: "Groom",
    brideName: "Bride",
    eventDate: TODAY,
    venue: demoResepsiVenue,
    city: demoCity,
    templateId: scarlet ? scarlet.id : null,
    packageId: gold ? gold.id : null,
    status: "draft",
    sections: MAIN_SECTIONS,
  });

  // 4. Extra weddings
  const weddingBySlug = new Map();
  weddingBySlug.set(mainWedding.slug, mainWedding);
  for (const w of EXTRA_WEDDINGS) {
    const customer = userByEmail.get(w.customerEmail);
    const tpl = templateBySlug.get(w.template);
    const pkg = packageBySlug.get(w.pkg);
    const row = await upsertWeddingBySlug({
      userId: customer.id,
      slug: w.slug,
      groomName: w.groom,
      brideName: w.bride,
      eventDate: w.eventDate,
      venue: w.venue,
      city: w.city,
      templateId: tpl ? tpl.id : null,
      packageId: pkg ? pkg.id : null,
      status: w.status,
      sections: {},
    });
    weddingBySlug.set(row.slug, row);
  }
  summary.weddings = weddingBySlug.size;

  // 5. Guests of the main wedding. Reset non-deleted guests for this wedding
  //    first so re-runs converge (no natural unique key on guest name).
  await db
    .delete(guests)
    .where(and(eq(guests.weddingId, mainWedding.id), isNull(guests.deletedAt)));
  const guestRows = await db
    .insert(guests)
    .values(
      GUEST_SEED.map((g) => ({
        weddingId: mainWedding.id,
        name: g.name,
        group: g.group,
        phone: g.phone,
        side: g.side,
        status: g.status,
        partySize: g.count,
        foodChoice: g.food,
        invitationStatus: g.inv,
      })),
    )
    .returning();
  summary.guests = guestRows.length;

  // 6. Wishes of the main wedding. Same reset-then-insert strategy.
  await db
    .delete(wishes)
    .where(and(eq(wishes.weddingId, mainWedding.id), isNull(wishes.deletedAt)));
  const wishRows = await db
    .insert(wishes)
    .values(
      WISH_SEED.map((w) => ({
        weddingId: mainWedding.id,
        fromName: w.fromName,
        body: w.body,
        attending: w.attending,
        status: w.status,
        pinned: w.pinned,
      })),
    )
    .returning();
  summary.wishes = wishRows.length;

  // 7. Orders (from TRANSACTIONS)
  let orderCount = 0;
  for (const t of TRANSACTION_SEED) {
    const customer = userByEmail.get(t.customerEmail);
    const pkg = packageBySlug.get(t.pkg);
    const wedding = t.weddingSlug ? weddingBySlug.get(t.weddingSlug) : null;
    await upsertOrderByInvoice({
      invoiceNo: t.invoiceNo,
      // Follow the wedding's (possibly transferred) owner so re-seeding never
      // detaches an order from the account that owns the wedding.
      userId: wedding ? wedding.userId : customer.id,
      weddingId: wedding ? wedding.id : null,
      packageId: pkg ? pkg.id : null,
      description: t.description,
      amount: t.amount,
      method: t.method,
      status: t.status,
      paidAt: t.status === "paid" ? new Date() : null,
    });
    orderCount += 1;
  }
  summary.orders = orderCount;

  return summary;
}

seed()
  .then((summary) => {
    console.log("\nSeed complete. Per-table summary:");
    for (const [table, count] of Object.entries(summary)) {
      console.log(`  ${table.padEnd(12)} ${count}`);
    }
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
