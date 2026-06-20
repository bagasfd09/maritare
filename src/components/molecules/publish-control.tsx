"use client";

// Publish / unpublish control for the editor + overview topbars. Wraps the
// publishWedding / unpublishWedding server actions with an inline confirm step
// (publishing is high-stakes) and inline Bahasa feedback — matching the editor's
// existing inline SaveIndicator idiom rather than introducing a toast/modal lib.
//
// Status is tracked locally for instant feedback; the action also revalidates,
// so the sidebar pill + server props converge on the next RSC refresh.

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import { publishWedding, unpublishWedding } from "@/server/actions/publish";

type WeddingStatus = "draft" | "pending" | "live" | "expired";

type Feedback =
  | { tone: "ok" | "info"; text: string }
  | { tone: "err"; text: string; cta?: { href: string; label: string } };

export function PublishControl({
  slug,
  initialStatus,
}: {
  slug: string;
  initialStatus: WeddingStatus;
}) {
  const [status, setStatus] = useState<WeddingStatus>(initialStatus);
  const [confirming, setConfirming] = useState<null | "publish" | "unpublish">(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  const isLive = status === "live";

  function doPublish() {
    setConfirming(null);
    setFeedback(null);
    startTransition(async () => {
      const res = await publishWedding();
      if (res.ok) {
        setStatus("live");
        setFeedback({
          tone: "ok",
          text: res.alreadyLive ? "Undangan kamu sudah live." : "Undangan kamu sekarang live 🎉",
        });
      } else if (res.reason === "unpaid") {
        setFeedback({ tone: "err", text: res.error, cta: { href: "/dashboard/billing", label: "Ke Tagihan" } });
      } else {
        setFeedback({ tone: "err", text: res.error });
      }
    });
  }

  function doUnpublish() {
    setConfirming(null);
    setFeedback(null);
    startTransition(async () => {
      const res = await unpublishWedding();
      if (res.ok) {
        setStatus("draft");
        setFeedback({ tone: "info", text: "Undangan ditarik dari publik." });
      } else {
        setFeedback({ tone: "err", text: res.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {feedback && (
        <span
          className={cn(
            "text-[11px] font-medium inline-flex items-center gap-[6px] max-w-[340px]",
            feedback.tone === "ok" && "text-sage",
            feedback.tone === "info" && "text-muted-ink",
            feedback.tone === "err" && "text-burgundy",
          )}
        >
          {feedback.tone === "ok" && <Icon name="check" size={12} stroke="var(--color-sage)" />}
          {feedback.tone === "err" && <Icon name="x" size={12} stroke="var(--color-burgundy)" />}
          <span>{feedback.text}</span>
          {feedback.tone === "err" && feedback.cta && (
            <Link href={feedback.cta.href} className="underline whitespace-nowrap">
              {feedback.cta.label}
            </Link>
          )}
        </span>
      )}

      {isLive ? (
        <>
          <span className="text-[11px] text-sage tracking-[0.18em] uppercase font-semibold inline-flex items-center gap-[6px]">
            <span className="w-[7px] h-[7px] rounded-full bg-sage animate-dot-pulse" />
            Live
          </span>
          <a href={`/inv/${slug}`} target="_blank" rel="noopener">
            <Button variant="ghost" type="button">
              <Icon name="external" size={14} />
              Lihat
            </Button>
          </a>
          {confirming === "unpublish" ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-[11px] text-muted-ink">Tarik dari publik?</span>
              <Button variant="dark" type="button" disabled={pending} onClick={doUnpublish}>
                {pending ? "Menarik…" : "Ya, tarik"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => setConfirming(null)}>
                Batal
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setFeedback(null);
                setConfirming("unpublish");
              }}
            >
              Tarik
            </Button>
          )}
        </>
      ) : confirming === "publish" ? (
        <span className="inline-flex items-center gap-2">
          <span className="text-[11px] text-muted-ink">Publikasikan sekarang?</span>
          <Button variant="primary" type="button" disabled={pending} onClick={doPublish}>
            <Icon name="sparkle" size={14} />
            {pending ? "Mempublikasikan…" : "Ya, publish"}
          </Button>
          <Button variant="ghost" type="button" onClick={() => setConfirming(null)}>
            Batal
          </Button>
        </span>
      ) : (
        <Button
          variant="primary"
          type="button"
          disabled={pending}
          onClick={() => {
            setFeedback(null);
            setConfirming("publish");
          }}
        >
          <Icon name="sparkle" size={14} />
          Publish
        </Button>
      )}
    </div>
  );
}
