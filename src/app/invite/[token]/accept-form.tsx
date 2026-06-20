"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { acceptInvite } from "@/server/actions/team";

// Client accept form for a valid invite. On submit: create-or-promote the user
// via `acceptInvite`, then auto sign-in with the (now known) email + password
// and send them into the admin area. If auto sign-in fails, fall back to /login.
export function AcceptForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Isi nama lengkap dulu.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await acceptInvite({ token, name, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Account is ready — try auto sign-in with the invite's email + password.
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        // Fall back to the login screen with a success hint.
        router.push("/login?invited=1");
        return;
      }
      window.location.assign("/admin");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink">
          Email
        </span>
        <input
          type="email"
          value={email}
          readOnly
          className="bg-cream border border-line rounded-lg px-3 py-[10px] font-body text-[13px] text-muted-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink">
          Nama lengkap
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu"
          autoComplete="name"
          className="bg-paper border border-line rounded-lg px-3 py-[10px] font-body text-[13px] text-charcoal outline-none focus:border-charcoal"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-muted-ink">
          Buat kata sandi
        </span>
        <div className="flex items-center bg-paper border border-line rounded-lg px-3 focus-within:border-charcoal">
          <input
            type={revealed ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            className="flex-1 bg-transparent py-[10px] font-body text-[13px] text-charcoal outline-none"
          />
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="text-[10px] tracking-[0.12em] uppercase font-semibold text-burgundy bg-transparent border-none cursor-pointer"
          >
            {revealed ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </label>

      {error && (
        <p role="alert" className="text-[12px] text-burgundy">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 inline-flex items-center justify-center rounded-full bg-burgundy text-cream font-body font-medium tracking-[0.08em] uppercase text-[12px] h-[44px] cursor-pointer transition-colors hover:bg-burgundy-deep disabled:opacity-60"
      >
        {isPending ? "Memproses…" : "Terima & buat akun"}
      </button>
    </form>
  );
}
