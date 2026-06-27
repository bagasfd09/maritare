"use client";

// Shared dark-surface form primitives for the editor section forms. The exact
// utility classes are lifted from editor-canvas.tsx so every form matches the
// established editor visual language (cream-on-#1a1410, small-caps labels,
// transparent inputs with a hairline underline / soft-fill textareas).

import { cn } from "@/lib/utils";
import { Icon } from "@/components/atoms/icon";
import type { PartySide } from "@/lib/invitation/sections";

// Small-caps field label (matches editor-canvas label styling).
export function FieldLabel({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-[11px] text-[rgba(245,239,230,0.6)] tracking-[0.18em] uppercase font-semibold mb-2",
        className,
      )}
      {...props}
    />
  );
}

// Underline text input on the dark surface.
export function TextField({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-transparent border-none outline-none text-[15px] font-body text-cream py-[7px]",
        "border-b border-[rgba(245,239,230,0.2)] focus:border-[rgba(245,239,230,0.5)] transition-colors",
        "placeholder:text-[rgba(245,239,230,0.32)]",
        className,
      )}
      {...props}
    />
  );
}

// Soft-fill textarea on the dark surface.
export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "block w-full resize-none bg-[rgba(245,239,230,0.04)] rounded-[10px]",
        "border border-[rgba(245,239,230,0.12)] focus:border-[rgba(245,239,230,0.3)] transition-colors",
        "p-4 font-body text-[14px] leading-[1.6] text-cream outline-none",
        "placeholder:text-[rgba(245,239,230,0.32)]",
        className,
      )}
      {...props}
    />
  );
}

// Repeater "card" — a soft-bordered block holding one row of a repeater.
export function RepeaterCard({
  children,
  onRemove,
  removeLabel = "Hapus",
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="relative rounded-[12px] border border-[rgba(245,239,230,0.12)] bg-[rgba(245,239,230,0.03)] p-5">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-[rgba(245,239,230,0.5)] hover:text-burgundy cursor-pointer"
        >
          <Icon name="x" size={12} /> {removeLabel}
        </button>
      )}
      {children}
    </div>
  );
}

// "+ Tambah …" dashed add button.
export function AddButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-3 rounded-[10px] border border-dashed border-[rgba(245,239,230,0.22)]",
        "flex items-center justify-center gap-2 text-[12px] font-semibold text-[rgba(245,239,230,0.7)]",
        "hover:border-[rgba(245,239,230,0.4)] hover:text-cream transition-colors",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer",
      )}
    >
      <Icon name="plus" size={14} /> {children}
    </button>
  );
}

// Simple styled toggle (checkbox-driven switch) consistent with the dark surface.
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-[10px] cursor-pointer group"
    >
      <span
        className={cn(
          "relative w-[42px] h-[24px] rounded-full transition-colors shrink-0",
          checked ? "bg-sage" : "bg-[rgba(245,239,230,0.18)]",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] w-[18px] h-[18px] rounded-full bg-cream transition-all",
            checked ? "left-[21px]" : "left-[3px]",
          )}
        />
      </span>
      <span className="text-[13px] font-medium text-cream">{label}</span>
    </button>
  );
}

// 3-way "which family" picker for a gift account. "Keduanya" (both) is the safe
// default; pick a side to show that account only to guests invited by that family.
const SIDE_OPTIONS: { value: PartySide; label: string }[] = [
  { value: "both", label: "Keduanya" },
  { value: "groom", label: "Pihak pria" },
  { value: "bride", label: "Pihak wanita" },
];

export function SideField({
  value,
  onChange,
}: {
  value: PartySide;
  onChange: (next: PartySide) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {SIDE_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-[8px] border px-2 py-2 text-[12px] font-medium transition-colors cursor-pointer",
              active
                ? "border-sage bg-sage/15 text-cream"
                : "border-[rgba(245,239,230,0.14)] text-[rgba(245,239,230,0.55)] hover:border-[rgba(245,239,230,0.3)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// "Tandai selesai" toggle row shared by every form footer.
export function DoneToggle({
  done,
  onChange,
}: {
  done: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="mt-9 pt-6 border-t border-[rgba(245,239,230,0.1)]">
      <Toggle
        checked={done}
        onChange={onChange}
        label="Tandai bagian ini selesai"
      />
    </div>
  );
}

// Section eyebrow shown at the top of each form (matches the canvas SectionNumber).
export function FormHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-7 inline-flex items-center gap-3 font-display italic text-peach text-[12px] tracking-[0.04em] before:content-[''] before:w-[22px] before:h-px before:bg-current before:opacity-70">
      {children}
    </div>
  );
}
