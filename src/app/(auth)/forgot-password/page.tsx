import type { Metadata } from "next";
import { ForgotScreen } from "@/components/auth/forgot-screen";

export const metadata: Metadata = {
  title: "Pemulihan akun · Maritare",
  description: "Lupa kata sandi? Masukkan email terdaftar untuk menerima tautan pemulihan.",
};

export default function ForgotPasswordPage() {
  return <ForgotScreen />;
}
