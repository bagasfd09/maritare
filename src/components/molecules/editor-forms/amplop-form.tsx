"use client";

import { useCallback } from "react";

import type { EditorSaveStatus } from "@/components/molecules/editor-canvas";
import type { AmplopData } from "@/lib/invitation/sections";
import {
  AddButton,
  DoneToggle,
  FieldLabel,
  FormHeading,
  RepeaterCard,
  TextArea,
  TextField,
} from "@/components/molecules/editor-forms/form-ui";
import { useSectionAutosave } from "@/components/molecules/editor-forms/use-section-autosave";

const MAX_ROWS = 4;

type Account = { bank: string; number: string; holder: string };
type Ewallet = { provider: string; number: string; holder: string };

export type AmplopValue = { done: boolean; data: AmplopData };

type AmplopFormProps = {
  value: AmplopValue;
  onChange: (next: AmplopValue) => void;
  onStatusChange?: (status: EditorSaveStatus) => void;
};

function nonEmptyAccount(a: Account): boolean {
  return [a.bank, a.number, a.holder].some((v) => v.trim().length > 0);
}
function nonEmptyEwallet(e: Ewallet): boolean {
  return [e.provider, e.number, e.holder].some((v) => v.trim().length > 0);
}

// Complete amplop payload: drop fully-empty rows; strip empty giftAddress.
function toPayload(data: AmplopData): Record<string, unknown> {
  return {
    accounts: data.accounts
      .filter(nonEmptyAccount)
      .map((a) => ({ bank: a.bank.trim(), number: a.number.trim(), holder: a.holder.trim() })),
    ewallets: data.ewallets
      .filter(nonEmptyEwallet)
      .map((e) => ({
        provider: e.provider.trim(),
        number: e.number.trim(),
        holder: e.holder.trim(),
      })),
    giftAddress: data.giftAddress?.trim() ? data.giftAddress.trim() : undefined,
  };
}

export function AmplopForm({ value, onChange, onStatusChange }: AmplopFormProps) {
  const buildPayload = useCallback(
    () => ({ data: toPayload(value.data), done: value.done }),
    [value],
  );
  const { scheduleSave, flush, saveNow } = useSectionAutosave({
    sectionId: "amplop",
    buildPayload,
    onStatusChange,
  });

  function patchData(patch: Partial<AmplopData>) {
    onChange({ ...value, data: { ...value.data, ...patch } });
    scheduleSave();
  }

  function setDone(done: boolean) {
    onChange({ ...value, done });
    saveNow({ ...buildPayload(), done });
  }

  const accounts = value.data.accounts as Account[];
  const ewallets = value.data.ewallets as Ewallet[];

  return (
    <div className="max-w-[620px] mx-auto">
      <FormHeading>Amplop digital</FormHeading>

      {/* Rekening bank */}
      <div className="font-display italic text-[18px] text-cream mb-4">Rekening bank</div>
      <div className="flex flex-col gap-4 mb-7">
        {accounts.map((a, i) => (
          <RepeaterCard
            key={i}
            onRemove={() =>
              patchData({ accounts: accounts.filter((_, idx) => idx !== i) })
            }
          >
            <FieldLabel>Bank</FieldLabel>
            <TextField
              value={a.bank}
              onChange={(e) =>
                patchData({
                  accounts: accounts.map((x, idx) =>
                    idx === i ? { ...x, bank: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="cth. BCA"
              maxLength={40}
              className="mb-4"
            />
            <FieldLabel>Nomor rekening</FieldLabel>
            <TextField
              value={a.number}
              onChange={(e) =>
                patchData({
                  accounts: accounts.map((x, idx) =>
                    idx === i ? { ...x, number: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="cth. 1234567890"
              maxLength={30}
              className="mb-4"
            />
            <FieldLabel>Atas nama</FieldLabel>
            <TextField
              value={a.holder}
              onChange={(e) =>
                patchData({
                  accounts: accounts.map((x, idx) =>
                    idx === i ? { ...x, holder: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="Nama pemilik rekening"
              maxLength={80}
            />
          </RepeaterCard>
        ))}
        {accounts.length < MAX_ROWS && (
          <AddButton
            onClick={() => patchData({ accounts: [...accounts, { bank: "", number: "", holder: "" }] })}
          >
            Tambah rekening
          </AddButton>
        )}
      </div>

      {/* E-wallet */}
      <div className="font-display italic text-[18px] text-cream mb-4">E-wallet</div>
      <div className="flex flex-col gap-4 mb-7">
        {ewallets.map((w, i) => (
          <RepeaterCard
            key={i}
            onRemove={() =>
              patchData({ ewallets: ewallets.filter((_, idx) => idx !== i) })
            }
          >
            <FieldLabel>Provider</FieldLabel>
            <TextField
              value={w.provider}
              onChange={(e) =>
                patchData({
                  ewallets: ewallets.map((x, idx) =>
                    idx === i ? { ...x, provider: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="cth. GoPay / OVO / Dana"
              maxLength={30}
              className="mb-4"
            />
            <FieldLabel>Nomor</FieldLabel>
            <TextField
              value={w.number}
              onChange={(e) =>
                patchData({
                  ewallets: ewallets.map((x, idx) =>
                    idx === i ? { ...x, number: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="cth. 0812xxxxxxx"
              maxLength={30}
              className="mb-4"
            />
            <FieldLabel>Atas nama</FieldLabel>
            <TextField
              value={w.holder}
              onChange={(e) =>
                patchData({
                  ewallets: ewallets.map((x, idx) =>
                    idx === i ? { ...x, holder: e.target.value } : x,
                  ),
                })
              }
              onBlur={flush}
              placeholder="Nama pemilik"
              maxLength={80}
            />
          </RepeaterCard>
        ))}
        {ewallets.length < MAX_ROWS && (
          <AddButton
            onClick={() =>
              patchData({ ewallets: [...ewallets, { provider: "", number: "", holder: "" }] })
            }
          >
            Tambah e-wallet
          </AddButton>
        )}
      </div>

      {/* Gift address */}
      <FieldLabel>Alamat kirim kado (opsional)</FieldLabel>
      <TextArea
        value={value.data.giftAddress ?? ""}
        onChange={(e) => patchData({ giftAddress: e.target.value })}
        onBlur={flush}
        placeholder="Alamat untuk kirim hadiah fisik"
        className="min-h-[80px]"
        maxLength={300}
      />

      <DoneToggle done={value.done} onChange={setDone} />
    </div>
  );
}
