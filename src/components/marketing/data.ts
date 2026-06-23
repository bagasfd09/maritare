export type Story = {
  date: string;
  couple: string;
  venue: string;
  image: string;
};

export const stories: Story[] = [
  {
    date: "14 Maret 2026",
    couple: "Andi & Putri",
    venue: "Pendopo Kayon, Yogyakarta",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=80",
  },
  {
    date: "22 Januari 2026",
    couple: "Rara & Bima",
    venue: "The Stones, Bali",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
  },
  {
    date: "8 November 2025",
    couple: "Sari & Iqbal",
    venue: "Ayana Midplaza, Jakarta",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80",
  },
  {
    date: "3 Mei 2026",
    couple: "Maya & Reza",
    venue: "Plataran Heritage, Bandung",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1100&q=85",
  },
  {
    date: "19 Juli 2025",
    couple: "Dina & Bayu",
    venue: "Gedung Kesenian, Jakarta",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80",
  },
  {
    date: "2 Februari 2026",
    couple: "Tiara & Galih",
    venue: "Tugu Kunstkring, Jakarta",
    image: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=900&q=80",
  },
  {
    date: "11 Oktober 2025",
    couple: "Nadya & Aldi",
    venue: "Hutan Pinus, Bandung",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80",
  },
];

export type Template = {
  name: string;
  tag: string;
  variant: "rose" | "cream" | "sage" | "terra";
  couple: { left: string; right: string };
  date: string;
};

export const templates: Template[] = [
  { name: "Modern Rose", tag: "Romantic", variant: "rose", couple: { left: "Maya", right: "Reza" }, date: "14 · 06 · 2026" },
  { name: "Classic Cream", tag: "Klasik", variant: "cream", couple: { left: "Dina", right: "Bayu" }, date: "22 · 08 · 2026" },
  { name: "Sage & Stone", tag: "Earthy", variant: "sage", couple: { left: "Sari", right: "Iqbal" }, date: "03 · 09 · 2026" },
  { name: "Terracotta Sun", tag: "Bohemian", variant: "terra", couple: { left: "Tiara", right: "Galih" }, date: "11 · 10 · 2026" },
];

export type PricingPlan = {
  name: string;
  tag: string;
  price: string;
  per: string;
  features: string[];
  cta: string;
  featured?: boolean;
  ribbon?: string;
};

export const pricing: PricingPlan[] = [
  {
    name: "Silver",
    tag: "Untuk acara intimate.",
    price: "150",
    per: "90 hari aktif · hingga 100 tamu",
    features: [
      "1 template editorial pilihan",
      "Foto gallery hingga 30 foto",
      "RSVP & buku tamu digital",
      "Background music & countdown",
    ],
    cta: "Pilih Silver",
  },
  {
    name: "Gold",
    tag: "Untuk acara standar.",
    price: "300",
    per: "180 hari aktif · hingga 300 tamu",
    features: [
      "Semua dari Silver, plus —",
      "Custom subdomain (nama.maritare.id)",
      "Livestream Zoom / YouTube embed",
      "QR check-in & export tamu",
    ],
    cta: "Pilih Gold",
    featured: true,
    ribbon: "Paling Dicari",
  },
  {
    name: "Platinum",
    tag: "Untuk pernikahan besar.",
    price: "500",
    per: "1 tahun aktif · tamu unlimited",
    features: [
      "Semua dari Gold, plus —",
      "Custom domain (.com / .id)",
      "Foto gallery unlimited",
      "Konsultasi desain 1-on-1",
    ],
    cta: "Pilih Platinum",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  city: string;
  month: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Tamu kami bilang ini undangan terbagus yang pernah mereka terima. Beberapa malah sengaja screenshot buat referensi pas mereka nikah nanti.",
    name: "Andi & Putri",
    city: "Jakarta",
    month: "Maret 2026",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=70",
  },
  {
    quote:
      "Yang bikin tenang itu RSVP-nya. Sebelum pakai Maritare, kami harus chat satu-satu. Sekarang langsung kelihatan di dashboard.",
    name: "Rara & Bima",
    city: "Bandung",
    month: "Januari 2026",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=70",
  },
];

export type FaqItem = { q: string; a: string };

export const faqs: FaqItem[] = [
  {
    q: "Berapa lama undangan aktif setelah dipublish?",
    a: "Tergantung paket: Silver 90 hari, Gold 180 hari, Platinum 1 tahun penuh dari tanggal publish. Bisa diperpanjang kapan saja dengan top-up paket.",
  },
  {
    q: "Bagaimana cara kirim undangan ke tamu?",
    a: "Setelah publish, kamu dapat satu link unik (maritare.id/nama-kalian). Bagi lewat WhatsApp, atau export gambar undangan untuk broadcast ke grup.",
  },
  {
    q: "Apakah ada batas jumlah tamu yang RSVP?",
    a: "Silver hingga 100 tamu, sedangkan Gold & Platinum unlimited. Yang dihitung adalah jumlah konfirmasi RSVP unik, bukan visitor undangan.",
  },
  {
    q: "Apakah data tamu kami aman?",
    a: "Aman. Semua data dienkripsi end-to-end dan tersimpan di server Indonesia (Jakarta). Kami tidak pernah membagikan data ke pihak ketiga.",
  },
];

export type FloatPhoto = {
  src: string;
  top: string;
  left: string;
  size: number;
  rotate: number;
  bob: number; // px amplitude
  dur: number; // seconds
  delay: number; // seconds
};

export const floatPhotos: FloatPhoto[] = [
  { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80", top: "8%",  left: "6%",   size: 140, rotate: -8, bob: 6, dur: 4.2, delay: 0.2 },
  { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&q=80", top: "20%", left: "82%",  size: 110, rotate: 6,  bob: 4, dur: 3.6, delay: 0.6 },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=350&q=80", top: "60%", left: "4%",   size: 120, rotate: 10, bob: 5, dur: 4.8, delay: 0.1 },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80", top: "72%", left: "78%",  size: 160, rotate: -6, bob: 5, dur: 4.0, delay: 0.4 },
  { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=240&q=80", top: "12%", left: "44%",  size: 80,  rotate: 4,  bob: 3, dur: 3.2, delay: 0.8 },
  { src: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=350&q=80", top: "78%", left: "44%",  size: 100, rotate: -4, bob: 4, dur: 4.5, delay: 0.3 },
];

export const partnerLogos = ["Bridestory", "Parents Guide", "The Bride Dept", "Femina"];
