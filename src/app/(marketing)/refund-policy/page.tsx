import type { Metadata } from "next";
import { LegalPage, type Section } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Kebijakan Refund — Maritare",
  description: "Ketentuan pengembalian dana untuk pembelian paket undangan digital Maritare.",
};

const sections: Section[] = [
  {
    heading: "1. Sifat produk",
    body: "Maritare adalah produk digital berupa website undangan yang aktif seketika setelah pembayaran dan proses publish. Karena bersifat digital dan langsung dapat digunakan, pengembalian dana hanya berlaku pada kondisi tertentu di bawah ini.",
  },
  {
    heading: "2. Refund penuh (100%)",
    body: [
      "Kamu berhak atas pengembalian dana penuh jika:",
      "• Pembayaran berhasil terpotong namun paket tidak aktif akibat kesalahan sistem kami, dan tidak bisa kami perbaiki dalam 3×24 jam.",
      "• Terjadi pembayaran ganda (double charge) untuk paket yang sama.",
    ],
  },
  {
    heading: "3. Refund sebagian",
    body: "Jika kamu membatalkan dalam 24 jam setelah pembayaran DAN undangan belum pernah dibagikan/diakses tamu, kami mengembalikan dana setelah dipotong biaya administrasi payment gateway (maks. 5%).",
  },
  {
    heading: "4. Tidak dapat direfund",
    body: [
      "Refund tidak berlaku untuk:",
      "• Undangan yang sudah dipublish dan dibagikan ke tamu.",
      "• Pembatalan atau perubahan jadwal acara pernikahan.",
      "• Ketidakcocokan selera desain, selama fitur berfungsi sesuai deskripsi paket.",
      "• Masa aktif yang sudah berjalan atau sudah berakhir.",
    ],
  },
  {
    heading: "5. Cara mengajukan refund",
    body: "Kirim email ke support@maritare.id dengan subjek \"Refund\", sertakan email akun, nama paket, dan bukti pembayaran. Kami memproses pengajuan dalam 7 hari kerja. Dana dikembalikan ke metode pembayaran awal, dan waktu sampainya mengikuti kebijakan bank/penyedia pembayaran masing-masing.",
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Kebijakan Refund"
      updated="1 Juli 2026"
      intro="Kami ingin kamu tenang saat membeli. Berikut ketentuan pengembalian dana untuk paket undangan Maritare."
      sections={sections}
    />
  );
}
