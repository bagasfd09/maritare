import type { Metadata } from "next";
import { LegalPage, type Section } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "FAQ — Maritare",
  description: "Pertanyaan yang sering ditanyakan calon pengantin soal undangan digital Maritare.",
};

const sections: Section[] = [
  {
    heading: "Berapa lama undangan aktif setelah dipublish?",
    body: "Tergantung paket: Silver 90 hari, Gold 180 hari, Platinum 1 tahun penuh terhitung dari tanggal publish. Bisa diperpanjang kapan saja lewat top-up paket.",
  },
  {
    heading: "Kapan aku bayar?",
    body: "Bikin dan atur undangan kamu gratis dulu. Pembayaran baru diperlukan saat kamu siap publish supaya undangan bisa diakses tamu. Sebelum publish, tidak ada biaya apa pun.",
  },
  {
    heading: "Bagaimana cara kirim undangan ke tamu?",
    body: "Setelah publish, kamu dapat satu link unik (maritare.id/nama-kalian). Bagikan lewat WhatsApp, atau export gambar undangan untuk broadcast ke grup.",
  },
  {
    heading: "Apakah ada batas jumlah tamu yang RSVP?",
    body: "Silver hingga 100 tamu, sedangkan Gold & Platinum unlimited. Yang dihitung adalah jumlah konfirmasi RSVP unik, bukan jumlah pengunjung undangan.",
  },
  {
    heading: "Bisa ganti template setelah bayar?",
    body: "Bisa, selama undangan masih dalam masa aktif. Sebagian konten mungkin perlu kamu sesuaikan ulang mengikuti layout template baru.",
  },
  {
    heading: "Apakah data tamu kami aman?",
    body: "Aman. Semua data dienkripsi dan tersimpan di server Indonesia (Jakarta). Kami tidak pernah membagikan data kamu ke pihak ketiga untuk keperluan iklan.",
  },
  {
    heading: "Apakah bisa refund?",
    body: "Bisa, dengan syarat. Detailnya ada di halaman Kebijakan Refund kami.",
  },
];

export default function FaqPage() {
  return (
    <LegalPage
      eyebrow="Pusat Bantuan"
      title="Pertanyaan yang sering ditanyakan"
      updated="1 Juli 2026"
      intro="Kumpulan hal yang paling sering ditanyakan calon pengantin sebelum bikin undangan di Maritare."
      sections={sections}
    />
  );
}
