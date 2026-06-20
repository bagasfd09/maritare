"use client";

// Client buttons that drive wish moderation from the dashboard list. The cards
// themselves are server-rendered; these isolate the interactivity. On success we
// refresh the route so the moderated wish moves out of the pending bucket.

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { MobileButton } from "@/components/molecules/mobile-primitives";
import { moderateWish } from "@/server/actions/wishes";

function useModerate(wishId: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const run = (action: "approve" | "reject") =>
    startTransition(async () => {
      const res = await moderateWish({ wishId, action });
      if (res.ok) router.refresh();
    });
  return { run, isPending };
}

/** Desktop: Setujui / Tolak (WishCard). */
export function WishModerationActions({ wishId }: { wishId: string }) {
  const { run, isPending } = useModerate(wishId);
  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="h-7 px-3"
        disabled={isPending}
        onClick={() => run("approve")}
      >
        <Icon name="check" size={11} />
        Setujui
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-3"
        disabled={isPending}
        onClick={() => run("reject")}
      >
        <Icon name="x" size={11} />
        Tolak
      </Button>
    </>
  );
}

/** Mobile: Setujui / Sembunyikan. */
export function WishModerationActionsMobile({ wishId }: { wishId: string }) {
  const { run, isPending } = useModerate(wishId);
  return (
    <>
      <MobileButton
        variant="primary"
        className="h-[38px] flex-1 text-xs"
        disabled={isPending}
        onClick={() => run("approve")}
      >
        <Icon name="check" size={14} /> Setujui
      </MobileButton>
      <MobileButton
        variant="ghost"
        className="h-[38px] text-xs"
        disabled={isPending}
        onClick={() => run("reject")}
      >
        Sembunyikan
      </MobileButton>
    </>
  );
}
