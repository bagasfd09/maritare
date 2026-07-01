import type { Metadata } from "next";
import { LegalPage, type Section } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Maritare",
  description: "Syarat dan ketentuan penggunaan layanan undangan digital Maritare.",
};

const sections: Section[] = [
  {
    heading: "1. Penerimaan ketentuan",
    body: "Dengan membuat akun atau menggunakan layanan Maritare, kamu dianggap membaca, memahami, dan menyetujui seluruh syarat dan ketentuan ini beserta Kebijakan Refund yang menyertainya.",
  },
  {
    heading: "2. Akun",
    body: "Kamu bertanggung jawab menjaga kerahasiaan akses akunmu dan atas seluruh aktivitas yang terjadi di dalamnya. Satu akun ditujukan untuk penggunaan pribadi/pasangan, bukan untuk dijual atau dialihkan tanpa persetujuan kami.",
  },
  {
    heading: "3. Layanan & pembayaran",
    body: "Undangan bisa dibuat dan diatur tanpa biaya. Undangan hanya dapat dipublish setelah pembayaran paket berhasil. Masa aktif dan kuota tamu mengikuti paket yang dipilih (Silver, Gold, atau Platinum). Harga dapat berubah sewaktu-waktu, namun tidak memengaruhi paket yang sudah kamu beli.",
  },
  {
    heading: "4. Konten kamu",
    body: "Foto, tulisan, dan data tamu yang kamu unggah tetap menjadi milikmu. Kamu memberi kami izin terbatas untuk menyimpan dan menampilkannya semata-mata untuk menjalankan layanan. Kamu menjamin memiliki hak atas konten tersebut dan tidak melanggar hak pihak lain.",
  },
  {
    heading: "5. Penggunaan yang dilarang",
    body: [
      "Kamu setuju untuk tidak:",
      "• Mengunggah konten ilegal, melanggar hukum, atau menyinggung SARA.",
      "• Menyalahgunakan layanan untuk spam, penipuan, atau menyebarkan malware.",
      "• Mencoba meretas, membebani, atau mengganggu sistem kami.",
    ],
  },
  {
    heading: "6. Ketersediaan layanan",
    body: "Kami berupaya menjaga layanan tetap tersedia, namun tidak menjamin bebas gangguan 100%. Kami dapat melakukan pemeliharaan terjadwal dan akan berusaha memberi tahu sebelumnya bila memungkinkan.",
  },
  {
    heading: "7. Batasan tanggung jawab",
    body: "Maritare tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan. Tanggung jawab kami maksimal sebesar nilai paket yang kamu bayarkan.",
  },
  {
    heading: "8. Perubahan ketentuan",
    body: "Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di halaman ini. Penggunaan layanan setelah perubahan berarti kamu menyetujui versi terbaru.",
  },
  {
    heading: "9. Hukum yang berlaku",
    body: "Ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan diselesaikan secara musyawarah terlebih dahulu.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      updated="1 Juli 2026"
      intro="Ketentuan penggunaan layanan Maritare. Mohon dibaca sebelum kamu memakai layanan kami."
      sections={sections}
    />
  );
}
