// Fonnte WhatsApp send client. SERVER-ONLY — reads FONNTE_TOKEN from the
// environment and must never be imported into a client bundle (per AGENTS.md:
// never expose the Fonnte token to the client). Use from Server Actions only.

const FONNTE_ENDPOINT = "https://api.fonnte.com/send";

export type FonnteResult = { ok: true } | { ok: false; error: string };

/**
 * Send one WhatsApp message via Fonnte. `target` is an international MSISDN
 * (digits, no "+", e.g. "62812..."). Returns a wrapped result — never throws —
 * so a single failed recipient can't abort a blast.
 */
export async function sendFonnteMessage(input: {
  target: string;
  message: string;
}): Promise<FonnteResult> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    return { ok: false, error: "FONNTE_TOKEN belum dikonfigurasi di server." };
  }

  try {
    const body = new URLSearchParams({
      target: input.target,
      message: input.message,
      countryCode: "62",
    });

    const res = await fetch(FONNTE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body,
    });

    const data: unknown = await res.json().catch(() => null);
    // Fonnte responds with { status: boolean, reason?: string, ... }.
    const status =
      data && typeof data === "object" && "status" in data
        ? (data as { status?: unknown }).status
        : undefined;
    const reason =
      data && typeof data === "object" && "reason" in data
        ? String((data as { reason?: unknown }).reason ?? "")
        : "";

    if (!res.ok || status === false) {
      return { ok: false, error: reason || "Gagal mengirim WhatsApp." };
    }
    return { ok: true };
  } catch (error) {
    console.error("sendFonnteMessage failed", error);
    return { ok: false, error: "Gagal menghubungi layanan WhatsApp." };
  }
}
