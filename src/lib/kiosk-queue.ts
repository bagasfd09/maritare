// Offline check-in queue for the guestbook kiosk (client-side).
//
// Venue wifi is unreliable, so kiosk mutations that fail on the network are
// queued in localStorage and replayed when connectivity returns. The client's
// displayed guest list is always `applyQueue(lastServerSnapshot, queue)` — the
// snapshot stays pristine and the queue is the single source of local truth,
// so a reload (while online) reconstructs the exact same view.
//
// Replay safety: check-ins are idempotent UPDATEs; walk-ins replay as fresh
// INSERTs, so an op is only removed once the server confirms it.
//
// ponytail: single-tab assumption — two kiosk tabs on one device could race
// localStorage writes. BroadcastChannel if multi-tab ever matters.

import type { KioskGuest, KioskHeader } from "@/server/queries/guestbook";

/** Connectivity + pending-op count shown as the kiosk's sync chip. */
export type KioskSync = { online: boolean; queued: number };

export type PendingOp =
  | {
      kind: "checkin";
      guestId: string;
      partySize: number;
      /** Wall-clock ms when the operator confirmed (the real arrival moment). */
      at: number;
    }
  | {
      kind: "walkin";
      /** Client-generated uuid so the temp guest can render before the server assigns the real row. */
      localId: string;
      name: string;
      side: "groom" | "bride" | "both";
      partySize: number;
      note?: string;
      group?: string;
      at: number;
    };

// Keyed per wedding: a device later logged into a DIFFERENT wedding must never
// replay (or display) another wedding's pending ops.
const QUEUE_PREFIX = "maritare_kiosk_queue_v1:";
const keyFor = (weddingId: string) => `${QUEUE_PREFIX}${weddingId}`;

// localStorage is an external boundary (extensions, devtools, old app
// versions can write it) — validate each entry so ONE malformed op degrades
// to being dropped instead of crashing the kiosk render on every mount.
function isSide(v: unknown): v is "groom" | "bride" | "both" {
  return v === "groom" || v === "bride" || v === "both";
}

function isPendingOp(v: unknown): v is PendingOp {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.at !== "number" || typeof o.partySize !== "number") return false;
  if (o.kind === "checkin") return typeof o.guestId === "string";
  if (o.kind === "walkin") {
    return typeof o.localId === "string" && typeof o.name === "string" && isSide(o.side);
  }
  return false;
}

export function loadQueue(weddingId: string): PendingOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyFor(weddingId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isPendingOp) : [];
  } catch {
    return []; // corrupt/blocked storage — start clean rather than crash the kiosk
  }
}

// Walk-in ops carry guest PII (names, notes) — queues for OTHER weddings that
// went quiet for a week are dead (that event is over); purge them so a shared
// vendor device doesn't retain another customer's guest list forever. Recent
// foreign queues are kept: a re-login to that wedding still flushes them.
const STALE_QUEUE_MS = 7 * 24 * 60 * 60 * 1000;

export function purgeStaleQueues(currentWeddingId: string, now: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(QUEUE_PREFIX) || key === keyFor(currentWeddingId)) continue;
      let ops: PendingOp[] = [];
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        ops = Array.isArray(parsed) ? parsed.filter(isPendingOp) : [];
      } catch {
        // unparseable foreign queue — nothing recoverable in it
      }
      const newest = ops.reduce((max, op) => Math.max(max, op.at), 0);
      if (ops.length === 0 || now - newest > STALE_QUEUE_MS) stale.push(key);
    }
    for (const key of stale) window.localStorage.removeItem(key);
  } catch {
    // storage blocked — nothing to purge
  }
}

export function saveQueue(weddingId: string, ops: PendingOp[]): void {
  if (typeof window === "undefined") return;
  try {
    if (ops.length === 0) {
      window.localStorage.removeItem(keyFor(weddingId));
    } else {
      window.localStorage.setItem(keyFor(weddingId), JSON.stringify(ops));
    }
  } catch {
    // Quota/blocked storage: the in-memory queue still works for this session.
  }
}

/** A temp guest row for a queued walk-in, shaped exactly like a server row. */
export function walkInToGuest(op: Extract<PendingOp, { kind: "walkin" }>): KioskGuest {
  return {
    id: op.localId,
    name: op.name,
    group: op.group ?? null,
    side: op.side,
    status: "confirmed",
    partySize: op.partySize,
    foodChoice: null,
    invitationStatus: "none",
    isWalkIn: true,
    checkedInAt: new Date(op.at),
    checkedInPartySize: op.partySize,
  };
}

/**
 * The displayed guest list: the last server snapshot with every pending op
 * applied on top (check-ins marked, queued walk-ins appended), name-sorted to
 * match the server ordering.
 */
export function applyQueue(
  serverGuests: KioskGuest[],
  queue: PendingOp[],
): KioskGuest[] {
  if (queue.length === 0) return serverGuests;

  const byId = new Map(serverGuests.map((g) => [g.id, { ...g }]));
  for (const op of queue) {
    if (op.kind === "checkin") {
      const g = byId.get(op.guestId);
      if (g) {
        // Keep the earliest arrival time, always take the latest headcount —
        // a queued correction on an already-checked-in guest must display.
        g.checkedInAt = g.checkedInAt ?? new Date(op.at);
        g.checkedInPartySize = op.partySize;
        g.status = "confirmed";
      }
    } else if (!byId.has(op.localId)) {
      byId.set(op.localId, walkInToGuest(op));
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
}

/** Header stats recomputed from the displayed list (mirrors the SQL tallies). */
export function computeStats(
  guests: KioskGuest[],
  now: number = Date.now(),
): KioskHeader["stats"] {
  const since = now - 15 * 60 * 1000;
  let checkedIn = 0;
  let walkIns = 0;
  let lastFifteenMin = 0;
  for (const g of guests) {
    if (g.checkedInAt !== null) {
      checkedIn++;
      if (new Date(g.checkedInAt).getTime() >= since) lastFifteenMin++;
    }
    if (g.isWalkIn) walkIns++;
  }
  return { invited: guests.length, checkedIn, walkIns, lastFifteenMin };
}
