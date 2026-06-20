"use client";
/* eslint-disable @next/next/no-img-element -- decorative ornaments use raw <img> by design (next/image would re-proxy them) */

// Folk Garden wishes — "Ucapan & Doa". Reuses the Scarlet .wedding-wish-wrap
// markup/CSS (the Folk template renders inside .scarlet-inv) for the maroon-on-
// cream look, but kept deliberately simple: just a name + a wish + send.
// Attendance is collected up front at the opening RSVP gate (folk-rsvp), so it
// is intentionally absent here. The form is live only in `public` mode.

import { useState, useTransition } from "react";

import { submitInvitationResponse } from "@/server/actions/invitation";
import type { InvitationView } from "@/server/queries/invitation";

import { formatShortDateId } from "./format";

type Props = {
  data: InvitationView;
  mode: "public" | "ownerPreview" | "editorPreview";
  /** Guest's name — resolved ?g= guest first, else the ?to= display name. Used to
   *  pre-fill (but not lock) the wish form's name field. Absent on generic links. */
  guestName?: string;
};

type WishItem = InvitationView["wishes"][number] & { pendingModeration?: boolean };

const MESSAGE_MAX = 600;
// Wishes revealed per "Muat ucapan lainnya" click on the invitation.
const WISHES_PAGE = 5;

export function FolkWishes({ data, mode, guestName }: Props) {
  const slug = data.slug;
  const live = mode === "public";

  // Pre-fill the name with the invitation's guest (editable — they can change it).
  // Same prop on server + client, so the controlled input hydrates without a mismatch.
  const [name, setName] = useState(guestName ?? "");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<WishItem[]>(data.wishes);
  const [isPending, startTransition] = useTransition();

  const disabled = !live || isPending;

  // Show wishes in batches; a "Muat ucapan lainnya" button reveals the next batch.
  const [visible, setVisible] = useState(WISHES_PAGE);
  const shown = list.slice(0, visible);
  const hasMore = list.length > shown.length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!live) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName) {
      setError("Nama wajib diisi dulu ya.");
      return;
    }
    if (!trimmedMessage) {
      setError("Tulis ucapan dan doamu dulu ya.");
      return;
    }

    startTransition(async () => {
      const result = await submitInvitationResponse({
        slug,
        name: trimmedName,
        message: trimmedMessage,
        website,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Optimistic prepend — the real wish appears publicly after moderation.
      setList((prev) => [
        {
          fromName: trimmedName,
          body: trimmedMessage,
          createdAt: new Date().toISOString(),
          pendingModeration: true,
        },
        ...prev,
      ]);
      // Reset to the pre-filled guest name (empty on generic links) — a second
      // wish keeps the convenience, but an edited name isn't carried over to a
      // different guest on a shared device.
      setName(guestName ?? "");
      setMessage("");
    });
  };

  return (
    <section className="wedding-wish-wrap folk-wish" data-template="">
      <div className="orn-wish-1 right">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-52.webp" alt="" />
        </div>
      </div>
      <div className="orn-wish-1 left">
        <div className="image-wrap" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="500">
          <img loading="lazy" decoding="async" src="/invitation/scarlet/Orn-52.webp" alt="" />
        </div>
      </div>

      <div className="wedding-wish-inner">
        <div className="wedding-wish-head">
          <h1 className="wedding-wish-title" data-aos="fade-up" data-aos-duration="1200">
            Ucapan &amp; Doa
          </h1>
          <p
            className="wedding-wish-description"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="100"
          >
            Berikan ucapan dan do&rsquo;a terbaik untuk kedua mempelai
          </p>
        </div>

        <div className="wedding-wish-body">
          <div className="wedding-wish-form">
            <form onSubmit={handleSubmit} method="POST" id="weddingWishForm">
              {!live && (
                <div
                  className="form-group"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="100"
                >
                  Form aktif setelah dipublikasikan.
                </div>
              )}

              <div
                className="form-group guest-name-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="200"
              >
                <input
                  type="text"
                  name="name"
                  className="form-control guest-name"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  disabled={disabled}
                />
              </div>

              <div
                className="form-group guest-comment-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="300"
              >
                <textarea
                  className="form-control guest-comment"
                  name="comment"
                  rows={1}
                  placeholder="Tulis ucapan dan doamu…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MESSAGE_MAX}
                  disabled={disabled}
                />
              </div>

              {/* Honeypot — visually hidden; bots that fill it are silently dropped. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
              />

              {error && (
                <div
                  className="form-group"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-delay="350"
                >
                  {error}
                </div>
              )}

              <div
                className="submit-comment-wrap"
                data-aos="fade-up"
                data-aos-duration="1200"
                data-aos-delay="400"
              >
                <button
                  type="submit"
                  className="submit submit-comment"
                  data-last=""
                  disabled={disabled}
                >
                  {isPending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>

          {list.length > 0 && (
            <div className="comment-wrap show">
              {shown.map((wish, i) => (
                <div
                  className="comment-item"
                  id={`comment${i}`}
                  key={`${wish.createdAt}-${i}`}
                  data-aos="fade-up"
                  data-aos-duration="1200"
                >
                  <div className="comment-head">
                    <div className="ch-name-wrap">
                      <h3 className="comment-name">{wish.fromName}</h3>
                    </div>
                    <small className="comment-date">{formatShortDateId(wish.createdAt)}</small>
                  </div>
                  <div className="comment-body">
                    <p className="comment-caption">{wish.body}</p>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="wish-more">
                  <button type="button" onClick={() => setVisible((v) => v + WISHES_PAGE)}>
                    Muat ucapan lainnya
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
