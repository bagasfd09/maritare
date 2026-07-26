"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addWalkInGuest,
  checkInGuest,
  type AddWalkInInput,
} from "@/server/actions/guestbook";
import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";
import {
  applyQueue,
  computeStats,
  loadQueue,
  purgeStaleQueues,
  saveQueue,
  walkInToGuest,
  type KioskSync,
  type PendingOp,
} from "@/lib/kiosk-queue";
import { GuestbookIdle } from "@/components/templates/guestbook-idle";
import { GuestbookSearch } from "@/components/templates/guestbook-search";
import { GuestbookQr } from "@/components/templates/guestbook-qr";
import { GuestbookConfirm } from "@/components/templates/guestbook-confirm";
import { GuestbookNotFound } from "@/components/templates/guestbook-notfound";
import { GuestbookThankYou } from "@/components/templates/guestbook-thankyou";

// The whole guest-facing kiosk flow lives on ONE route with client-side view
// state, so navigation between screens never needs the network. The server
// renders the initial snapshot; from then on this component owns the data:
//
//   displayed guests = applyQueue(last server snapshot, pending ops)
//
// Mutations try the server first; a network failure (or timeout, or a
// transient `retryable` server failure) queues the op in localStorage and
// applies it optimistically. A background loop every SYNC_INTERVAL_MS:
//   1) polls /api/guestbook/snapshot (a GET fetch, NOT a server action —
//      actions dispatch one-at-a-time per client, and a slow poll must never
//      head-of-line block an interactive check-in) — this also verifies the
//      session still belongs to THIS wedding before anything replays;
//   2) replays pending ops in order, echoing each confirmed result into the
//      snapshot state so synced work never vanishes from the directory while
//      the next refresh is pending.
// Known limitation (v1, no service worker): a full page RELOAD while offline
// still fails — the queue survives it, only the shell needs the network once.

export type KioskInitialView = "search" | "qr" | "notfound";

type View =
  | { name: "idle" | "search" | "qr" | "notfound" }
  | { name: "confirm"; guest: KioskGuest }
  | { name: "thankyou"; guest: KioskGuest | null };

const SYNC_INTERVAL_MS = 20_000;
const SNAPSHOT_TIMEOUT_MS = 15_000;
const REPLAY_TIMEOUT_MS = 15_000;
// Interactive waits before falling back to the offline queue. Walk-ins wait
// longer: a timed-out INSERT that actually landed replays as a duplicate row
// (check-ins are idempotent, so they can give up sooner).
// ponytail: a duplicated walk-in from that razor-thin window is fixed by
// deleting the row in the dashboard; no dedup protocol until it hurts.
const CHECKIN_TIMEOUT_MS = 6_000;
const WALKIN_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("kiosk action timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

type Snapshot = { header: KioskHeader; guests: KioskGuest[] };

// JSON serialization turns the Date columns into ISO strings — revive them so
// the wire shape matches what the server-rendered initial props carry.
type WireGuest = Omit<KioskGuest, "checkedInAt"> & { checkedInAt: string | null };

async function fetchSnapshot(): Promise<Snapshot | null> {
  const res = await fetch("/api/guestbook/snapshot", {
    cache: "no-store",
    signal: AbortSignal.timeout(SNAPSHOT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`kiosk snapshot failed: ${res.status}`);
  const data = (await res.json()) as { header: KioskHeader; guests: WireGuest[] } | null;
  if (data === null) return null;
  return {
    header: data.header,
    guests: data.guests.map((g) => ({
      ...g,
      checkedInAt: g.checkedInAt ? new Date(g.checkedInAt) : null,
    })),
  };
}

export function GuestbookFlow({
  initial,
  initialView,
}: {
  initial: Snapshot;
  initialView?: KioskInitialView;
}) {
  const router = useRouter();
  const [server, setServer] = useState<Snapshot>(initial);
  // null = not loaded yet — localStorage is read post-hydration so the server
  // and client first paints match. The persist effect skips the null phase.
  const [queue, setQueue] = useState<PendingOp[] | null>(null);
  const [view, setView] = useState<View>({ name: initialView ?? "idle" });
  const [online, setOnline] = useState(true);

  // Never changes while mounted: the sync loop hard-reloads before accepting a
  // snapshot from a different wedding, so queue persistence stays keyed to the
  // wedding this flow booted for.
  const weddingId = server.header.weddingId;
  const ops = useMemo(() => queue ?? [], [queue]);

  const guests = useMemo(() => applyQueue(server.guests, ops), [server.guests, ops]);
  const header = useMemo<KioskHeader>(
    () => ({ ...server.header, stats: computeStats(guests) }),
    [server.header, guests],
  );
  const sync = useMemo<KioskSync>(
    () => ({ online, queued: ops.length }),
    [online, ops.length],
  );

  // Interval closures read the queue through a ref so replay always sees the
  // latest ops without re-arming the interval on every mutation.
  const queueRef = useRef<PendingOp[] | null>(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    if (queue !== null) saveQueue(weddingId, queue);
  }, [weddingId, queue]);

  // True while an operator-initiated mutation is awaiting the server. The
  // background sync defers to it: replayed ops share the client's serial
  // server-action lane, and a stale snapshot applied mid-mutation would
  // overwrite the interactive echo.
  const interactiveRef = useRef(false);
  // Bumped when an interactive mutation STARTS. A snapshot download can
  // outlive a whole mutation (in-flight boolean alone misses that), so the
  // sync loop also discards any snapshot fetched across an epoch change —
  // its DB read may predate the mutation it would otherwise erase.
  const mutationEpochRef = useRef(0);
  // localId → server id for walk-ins whose queued op already replayed. A
  // confirm view opened on the temp guest can then still check in / correct
  // the headcount against the real row.
  const walkInIdMapRef = useRef(new Map<string, string>());

  const enqueue = useCallback((op: PendingOp) => {
    setQueue((q) => [...(q ?? []), op]);
    setOnline(false);
  }, []);

  // Echo a confirmed mutation into the snapshot state so the directory and
  // counters reflect it before the next poll. `?? at` keeps an earlier
  // check-in time if another device already checked the guest in.
  const echoCheckIn = useCallback((guestId: string, partySize: number, at: Date) => {
    setServer((s) => ({
      ...s,
      guests: s.guests.map((g) =>
        g.id === guestId
          ? {
              ...g,
              checkedInAt: g.checkedInAt ?? at,
              checkedInPartySize: partySize,
              status: "confirmed" as const,
            }
          : g,
      ),
    }));
  }, []);

  const echoWalkIn = useCallback((created: KioskGuest) => {
    setServer((s) =>
      s.guests.some((g) => g.id === created.id) ? s : { ...s, guests: [...s.guests, created] },
    );
  }, []);

  // ── Background sync: verify session + refresh snapshot, then replay ──
  const flushingRef = useRef(false);
  const syncNow = useCallback(async () => {
    if (flushingRef.current || interactiveRef.current) return;
    flushingRef.current = true;
    try {
      // 1) Snapshot FIRST — it verifies the token session still belongs to
      //    this wedding before a single queued op replays.
      const epoch = mutationEpochRef.current;
      let fresh: Snapshot | null;
      try {
        fresh = await fetchSnapshot();
      } catch {
        setOnline(false); // offline — replay would fail the same way
        return;
      }
      if (fresh === null) {
        // Genuinely kicked/revoked. The queue stays persisted — it flushes
        // after the next login to this wedding.
        router.push("/guestbook/login?kicked=1");
        return;
      }
      if (fresh.header.weddingId !== weddingId) {
        // The gb_session cookie was re-issued for ANOTHER wedding (login in a
        // second tab). Hard reload so the server mounts that wedding's flow;
        // this wedding's queue stays untouched under its own storage key.
        window.location.assign("/guestbook");
        return;
      }
      if (interactiveRef.current || mutationEpochRef.current !== epoch) {
        return; // an operator tap raced the download — apply nothing, next tick refreshes
      }
      setServer(fresh);
      setOnline(true);

      // 2) Replay pending ops in order. expectedWeddingId makes each replay
      //    fail closed server-side if the session switches weddings between
      //    the snapshot check and this call.
      // Ops are removed by their stable key (never object identity): an
      // in-place headcount edit swaps the op object while its replay is in
      // flight, and an identity filter would miss it and replay it again.
      for (const op of queueRef.current ?? []) {
        if (interactiveRef.current) return;
        try {
          if (op.kind === "checkin") {
            const result = await withTimeout(
              checkInGuest({
                guestId: op.guestId,
                partySize: op.partySize,
                expectedWeddingId: weddingId,
              }),
              REPLAY_TIMEOUT_MS,
            );
            if (!result.ok) {
              // Kicked / wrong wedding / transient server failure: KEEP the op.
              if (result.unauthenticated || result.retryable) return;
              console.error("kiosk replay rejected", result.error); // permanent → drop
            } else {
              // Echo BEFORE removing the op: the displayed list must never
              // lose confirmed work while the next snapshot is pending.
              echoCheckIn(op.guestId, op.partySize, new Date(op.at));
            }
            setQueue((q) =>
              (q ?? []).filter(
                (x) => !(x.kind === "checkin" && x.guestId === op.guestId && x.at === op.at),
              ),
            );
          } else {
            const result = await withTimeout(
              addWalkInGuest({
                name: op.name,
                side: op.side,
                partySize: op.partySize,
                note: op.note,
                group: op.group,
                expectedWeddingId: weddingId,
              }),
              REPLAY_TIMEOUT_MS,
            );
            if (!result.ok) {
              if (result.unauthenticated || result.retryable) return;
              console.error("kiosk replay rejected", result.error);
              setQueue((q) =>
                (q ?? []).filter((x) => !(x.kind === "walkin" && x.localId === op.localId)),
              );
            } else {
              const created = { ...walkInToGuest(op), id: result.guestId };
              walkInIdMapRef.current.set(op.localId, created.id);
              echoWalkIn(created);
              // Remove by localId; if a headcount edit raced this replay, the
              // queue holds a NEWER version of the op — carry the corrected
              // count forward as a check-in against the real row.
              setQueue((q) => {
                const list = q ?? [];
                const current = list.find(
                  (x): x is Extract<PendingOp, { kind: "walkin" }> =>
                    x.kind === "walkin" && x.localId === op.localId,
                );
                const rest = list.filter(
                  (x) => !(x.kind === "walkin" && x.localId === op.localId),
                );
                return current && current.partySize !== op.partySize
                  ? [
                      ...rest,
                      {
                        kind: "checkin",
                        guestId: created.id,
                        partySize: current.partySize,
                        at: current.at,
                      },
                    ]
                  : rest;
              });
            }
          }
        } catch {
          setOnline(false); // connectivity dropped mid-replay — retry next tick
          return;
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }, [router, weddingId, echoCheckIn, echoWalkIn]);

  useEffect(() => {
    // Deferred so the effect body never sets state synchronously; also seeds
    // the connectivity flag and flushes anything left over from a previous
    // session (e.g. the tab was closed while offline).
    const boot = setTimeout(() => {
      const loaded = loadQueue(weddingId);
      setQueue(loaded);
      // The ref is normally synced by effect AFTER the re-render — seed it now
      // so this first syncNow already replays leftovers from a prior session.
      queueRef.current = loaded;
      setOnline(navigator.onLine);
      purgeStaleQueues(weddingId);
      void syncNow();
    }, 0);
    const onOnline = () => void syncNow();
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const id = setInterval(() => void syncNow(), SYNC_INTERVAL_MS);
    return () => {
      clearTimeout(boot);
      clearInterval(id);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [weddingId, syncNow]);

  // ── Mutations: server first, queue on network/transient failure ──
  const handleCheckIn = useCallback(
    async (guest: KioskGuest, partySize: number): Promise<string | null> => {
      const now = new Date();

      // The picked "guest" may be a queued offline walk-in whose id is a
      // client localId the server has never seen — a re-confirm (headcount
      // correction) just updates the pending op by its localId.
      const isPendingWalkIn = (queueRef.current ?? []).some(
        (op) => op.kind === "walkin" && op.localId === guest.id,
      );
      if (isPendingWalkIn) {
        setQueue((q) =>
          (q ?? []).map((op) =>
            op.kind === "walkin" && op.localId === guest.id ? { ...op, partySize } : op,
          ),
        );
        setView({ name: "thankyou", guest: { ...guest, checkedInPartySize: partySize } });
        return null;
      }

      // A walk-in whose op replayed while its confirm view was open — the
      // temp localId now maps to the real server row.
      const mappedId = walkInIdMapRef.current.get(guest.id);
      const target = mappedId ? { ...guest, id: mappedId } : guest;

      // Any older queued check-in for this guest is superseded by this tap —
      // left in place it would replay later and regress the correction.
      const dropSuperseded = (q: PendingOp[] | null) =>
        (q ?? []).filter((x) => !(x.kind === "checkin" && x.guestId === target.id));

      const recordOffline = () => {
        setQueue((q) => [
          ...dropSuperseded(q),
          { kind: "checkin", guestId: target.id, partySize, at: now.getTime() },
        ]);
        setOnline(false);
        setView({
          name: "thankyou",
          guest: { ...target, checkedInAt: now, checkedInPartySize: partySize },
        });
      };

      interactiveRef.current = true;
      mutationEpochRef.current += 1;
      try {
        const result = await withTimeout(
          checkInGuest({ guestId: target.id, partySize, expectedWeddingId: weddingId }),
          CHECKIN_TIMEOUT_MS,
        );
        if (!result.ok) {
          if (result.unauthenticated) {
            // Keep the tap: persist it synchronously — we navigate away now,
            // and it flushes after the next login to this wedding.
            const next: PendingOp[] = [
              ...dropSuperseded(queueRef.current),
              { kind: "checkin", guestId: target.id, partySize, at: now.getTime() },
            ];
            setQueue(next);
            saveQueue(weddingId, next);
            if (result.weddingMismatch) {
              // Session is valid but for ANOTHER wedding — remount that flow.
              window.location.assign("/guestbook");
            } else {
              router.push("/guestbook/login?kicked=1");
            }
            return null;
          }
          if (result.retryable) {
            recordOffline(); // server reachable but wobbly — same as offline
            return null;
          }
          return result.error;
        }
        setQueue(dropSuperseded);
        echoCheckIn(target.id, partySize, now);
        setOnline(true);
        setView({
          name: "thankyou",
          guest: { ...target, checkedInAt: now, checkedInPartySize: partySize },
        });
        return null;
      } catch {
        recordOffline();
        return null;
      } finally {
        interactiveRef.current = false;
      }
    },
    [router, weddingId, echoCheckIn],
  );

  const handleWalkIn = useCallback(
    async (input: AddWalkInInput): Promise<string | null> => {
      const now = new Date();

      const recordOffline = () => {
        const op: PendingOp = {
          kind: "walkin",
          localId: crypto.randomUUID(),
          name: input.name,
          side: input.side,
          partySize: input.partySize,
          note: input.note,
          group: input.group,
          at: now.getTime(),
        };
        enqueue(op);
        setView({ name: "thankyou", guest: walkInToGuest(op) });
      };

      interactiveRef.current = true;
      mutationEpochRef.current += 1;
      try {
        const result = await withTimeout(
          addWalkInGuest({ ...input, expectedWeddingId: weddingId }),
          WALKIN_TIMEOUT_MS,
        );
        if (!result.ok) {
          if (result.unauthenticated) {
            // Keep the tap: persist it synchronously — we navigate away now,
            // and it flushes after the next login to this wedding.
            const op: PendingOp = {
              kind: "walkin",
              localId: crypto.randomUUID(),
              name: input.name,
              side: input.side,
              partySize: input.partySize,
              note: input.note,
              group: input.group,
              at: now.getTime(),
            };
            const next = [...(queueRef.current ?? []), op];
            setQueue(next);
            saveQueue(weddingId, next);
            if (result.weddingMismatch) {
              window.location.assign("/guestbook");
            } else {
              router.push("/guestbook/login?kicked=1");
            }
            return null;
          }
          if (result.retryable) {
            recordOffline();
            return null;
          }
          return result.error;
        }
        const created: KioskGuest = {
          id: result.guestId,
          name: input.name,
          group: input.group ?? null,
          side: input.side,
          status: "confirmed",
          partySize: input.partySize,
          foodChoice: null,
          invitationStatus: "none",
          isWalkIn: true,
          checkedInAt: now,
          checkedInPartySize: input.partySize,
        };
        echoWalkIn(created);
        setOnline(true);
        setView({ name: "thankyou", guest: created });
        return null;
      } catch {
        recordOffline();
        return null;
      } finally {
        interactiveRef.current = false;
      }
    },
    [router, weddingId, enqueue, echoWalkIn],
  );

  // QR payloads resolve against the LOCAL list — works offline, and an unknown
  // uuid surfaces as "QR tidak dikenal" right on the scan screen instead of a
  // silent server-side bounce back to search.
  const resolveGuest = useCallback(
    (id: string) => guests.find((g) => g.id === id) ?? null,
    [guests],
  );

  const toIdle = useCallback(() => setView({ name: "idle" }), []);
  const toSearch = useCallback(() => setView({ name: "search" }), []);
  const toWalkIn = useCallback(() => setView({ name: "notfound" }), []);
  const toConfirm = useCallback(
    (guest: KioskGuest) => setView({ name: "confirm", guest }),
    [],
  );
  const onTab = useCallback(
    (tab: "search" | "qr") => setView({ name: tab }),
    [],
  );
  // A valid-uuid QR that missed the local directory may be a guest added after
  // the last poll — refresh once; the scan loop auto-retries the same QR.
  const onUnknownQr = useCallback(() => void syncNow(), [syncNow]);

  switch (view.name) {
    case "idle":
      return <GuestbookIdle header={header} sync={sync} onStart={toSearch} />;
    case "search":
      return (
        <GuestbookSearch
          header={header}
          guests={guests}
          sync={sync}
          onPick={toConfirm}
          onWalkIn={toWalkIn}
          onTab={onTab}
        />
      );
    case "qr":
      return (
        <GuestbookQr
          header={header}
          sync={sync}
          resolveGuest={resolveGuest}
          onFound={toConfirm}
          onUnknown={onUnknownQr}
          onSearch={toSearch}
          onCancel={toIdle}
          onTab={onTab}
        />
      );
    case "confirm":
      return (
        <GuestbookConfirm
          // key re-seeds the stepper's useState when the guest changes.
          key={view.guest.id}
          header={header}
          sync={sync}
          guest={view.guest}
          onConfirm={(partySize) => handleCheckIn(view.guest, partySize)}
          onBack={toSearch}
        />
      );
    case "notfound":
      return (
        <GuestbookNotFound
          header={header}
          sync={sync}
          onSubmit={handleWalkIn}
          onCancel={toSearch}
        />
      );
    case "thankyou":
      return (
        <GuestbookThankYou header={header} guest={view.guest} onDone={toIdle} />
      );
  }
}
