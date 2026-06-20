// Generic demo content for the TEMPLATE CATALOG preview. The catalog preview is
// global — it must show the template's design with neutral placeholder data, NOT
// the signed-in user's real wedding/gallery. (The editor preview, in contrast,
// renders the user's own InvitationView.)

import type { InvitationView } from "@/server/queries/invitation";

// Neutral placeholder gallery photos (generic dummies — not the user's uploads).
const DEMO_GALLERY = [
  "default-groom.png", // dummy_cowo_dark
  "default-bride.png", // dummy_cewe_dark
  "default-couple.jpg", // couple_silhouette
];

/** A neutral InvitationView for catalog previews of the given template slug. */
export function demoInvitation(templateSlug: string): InvitationView {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  return {
    slug: "preview",
    groomName: "Groom",
    brideName: "Bride",
    eventDate: today,
    venue: "Ballroom Hotel Tentrem",
    city: "Yogyakarta",
    status: "draft",
    templateSlug,
    sections: {
      pasangan: {
        groom: {
          fullName: "Groom",
          fatherName: "Surya Pratama",
          motherName: "Ratna Dewi",
          childOrder: "Putra pertama dari",
          instagram: "groom",
        },
        bride: {
          fullName: "Bride",
          fatherName: "Bambang Wijaya",
          motherName: "Sri Lestari",
          childOrder: "Putri pertama dari",
          instagram: "bride",
        },
        quote: {
          text: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.",
          source: "Q.S. Ar-Rum: 21",
        },
        showHeroText: true,
      },
      acara: {
        events: [
          {
            name: "Akad Nikah",
            date: today,
            timeStart: "08:00",
            timeEnd: "10:00",
            venue: "Masjid Agung Al-Falah",
            address: "Jl. Diponegoro No. 27, Yogyakarta",
            mapsUrl: "https://maps.google.com/?q=Masjid+Agung+Al-Falah",
          },
          {
            name: "Resepsi",
            date: today,
            timeStart: "11:00",
            timeEnd: "14:00",
            venue: "Ballroom Hotel Tentrem",
            address: "Jl. Diponegoro No. 27, Yogyakarta",
            mapsUrl: "https://maps.google.com/?q=Hotel+Tentrem+Yogyakarta",
          },
        ],
      },
      cerita: { title: "", body: "" },
      // Catalog preview curates all demo gallery photos so the grid still shows.
      galeri: { selectedPhotoIds: DEMO_GALLERY.map((_, i) => `demo-${i}`) },
      amplop: {
        accounts: [{ bank: "BCA", number: "1234567890", holder: "Bride" }],
        ewallets: [],
      },
      // No audio in the catalog preview.
      musik: { enabled: false, source: "preset" },
      rsvp: { enabled: true, maxPartySize: 2 },
      hero: { fullSize: false },
    },
    // Hero/cover = couple3_silhouette (isCover); gallery = the dummy placeholders.
    // Couple profile photos fall back to the template defaults (couplePhotoUrls
    // empty → default-groom/default-bride).
    photos: [
      {
        id: "demo-cover",
        url: "/invitation/scarlet/default-cover.jpg",
        label: null,
        isCover: true,
        isClosing: false,
      },
      ...DEMO_GALLERY.map((file, i) => ({
        id: `demo-${i}`,
        url: `/invitation/scarlet/${file}`,
        label: null,
        isCover: false,
        isClosing: false,
      })),
    ],
    couplePhotoUrls: {},
    wishes: [
      { fromName: "Sahabat", body: "Selamat menempuh hidup baru! Bahagia selalu ya 🌿", createdAt: now },
      { fromName: "Keluarga", body: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", createdAt: now },
    ],
  };
}
