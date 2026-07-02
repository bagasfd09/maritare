"use client";

import { MobileShell } from "@/components/templates/mobile-shell";
import { MobileEm } from "@/components/molecules/mobile-primitives";
import { GuestGroupsManager } from "@/components/organisms/guest-groups-manager";
import type { GuestGroupsData } from "@/server/queries/guest-groups";

// Mobile · Grup Tamu — same manager list as desktop inside the mobile shell
// (the manager's rows already work at phone widths).
export function GuestGroupsMobile({ data }: { data: GuestGroupsData }) {
  return (
    <MobileShell
      active="grup"
      eyebrow="Grup Tamu"
      title={
        <>
          Badge <MobileEm>grup.</MobileEm>
        </>
      }
    >
      <GuestGroupsManager groups={data.groups} />
    </MobileShell>
  );
}
