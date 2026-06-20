"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { cn } from "@/lib/utils";
import { GUEST_CSV_TEMPLATE } from "@/lib/guests-csv";

type GuestsImportModalProps = {
  open: boolean;
  onClose: () => void;
};

// Result of an import attempt — drives the footer + inline message UI.
type ImportResult =
  | { kind: "success"; message: string }
  | { kind: "partial"; message: string }
  | { kind: "error"; message: string };

// Trigger a client-side download of in-memory text as a file.
function downloadText(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  triggerBlobDownload(filename, blob);
}

// Trigger a client-side download of a Blob (used for the error zip).
function triggerBlobDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import tamu via CSV. Mirrors the reference "Import File" modal layout.
export function GuestsImportModal({ open, onClose }: GuestsImportModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  if (!open) return null;

  // Reset transient state, then close (guarded against closing mid-upload).
  function handleClose() {
    if (submitting) return;
    setFile(null);
    setResult(null);
    setDragging(false);
    onClose();
  }

  function pickFile(next: File | null) {
    setFile(next);
    setResult(null);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    pickFile(e.target.files?.[0] ?? null);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
  }

  function downloadTemplate() {
    // Prefix the BOM so Excel reads the UTF-8 file with the right encoding.
    downloadText("template-import-tamu.csv", "﻿" + GUEST_CSV_TEMPLATE, "text/csv");
  }

  async function handleImport() {
    if (!file || submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/guests/import", { method: "POST", body: fd });
      const ct = res.headers.get("content-type") ?? "";

      if (ct.includes("application/zip")) {
        // Some rows failed — body is a zip with the error log + rejected rows.
        const blob = await res.blob();
        triggerBlobDownload("import-error.zip", blob);
        const inserted = res.headers.get("X-Import-Inserted") ?? "0";
        const failed = res.headers.get("X-Import-Failed") ?? "0";
        router.refresh();
        setResult({
          kind: "partial",
          message: `${inserted} tamu masuk, ${failed} ditolak. File error diunduh — perbaiki lalu impor ulang.`,
        });
        return;
      }

      if (ct.includes("application/json")) {
        const data: { ok: boolean; inserted?: number; error?: string } = await res.json();
        if (data.ok) {
          router.refresh();
          setResult({
            kind: "success",
            message: `${data.inserted ?? 0} tamu berhasil diimport.`,
          });
        } else {
          setResult({ kind: "error", message: data.error ?? "Gagal mengimpor file." });
        }
        return;
      }

      setResult({ kind: "error", message: "Respons tidak dikenali dari server." });
    } catch {
      setResult({
        kind: "error",
        message: "Gagal menghubungi server. Periksa koneksi kamu lalu coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // The success/partial states are "done" — footer offers a single Tutup.
  const isDone = result?.kind === "success" || result?.kind === "partial";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — click to close (disabled while uploading). */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={handleClose}
        disabled={submitting}
        className="absolute inset-0 z-0 cursor-default border-none bg-[rgba(26,26,26,0.45)] disabled:cursor-not-allowed"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import File"
        className="relative z-10 w-full max-w-[460px] bg-paper border border-line rounded-2xl shadow-[0_24px_60px_rgba(26,26,26,0.28)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-line">
          <h2 className="font-display font-extrabold text-[20px] text-charcoal">Import File</h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={handleClose}
            disabled={submitting}
            className="text-muted-ink hover:text-charcoal cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Dropzone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "rounded-[14px] border border-dashed px-6 py-8 text-center transition-colors",
              dragging ? "border-burgundy bg-[rgba(124,45,45,0.04)]" : "border-charcoal/25 bg-cream",
            )}
          >
            <div className="flex justify-center mb-3 text-muted-ink">
              <Icon name="upload" size={28} stroke="var(--color-muted-ink)" />
            </div>
            <div className="font-body text-[13px] text-charcoal">Tarik &amp; letakkan file di sini</div>
            <div className="font-display italic text-[12px] text-faint my-2">Atau</div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/25 bg-paper px-4 h-9 font-body font-medium text-[11px] tracking-[0.08em] uppercase text-charcoal cursor-pointer transition-colors hover:border-charcoal"
            >
              Telusuri File
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={onInputChange}
              className="hidden"
            />

            {file && (
              <div className="mt-3 inline-flex items-center gap-[6px] text-[12px] text-charcoal">
                <Icon name="check" size={13} stroke="var(--color-burgundy)" />
                <span className="font-semibold break-all">{file.name}</span>
              </div>
            )}

            <div className="mt-4 text-[10px] tracking-[0.16em] uppercase font-semibold text-faint">
              Format didukung: CSV
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2 text-[12px] text-burgundy underline underline-offset-2 cursor-pointer hover:text-burgundy-deep"
            >
              Unduh Template di sini
            </button>
          </div>

          {/* Inline result / error message */}
          {result && (
            <div
              className={cn(
                "mt-4 rounded-[10px] px-4 py-3 text-[12px] leading-[1.5]",
                result.kind === "success" && "bg-sage-soft text-[#1c5a36]",
                result.kind === "partial" && "bg-peach text-[#5a2a18]",
                result.kind === "error" && "bg-[rgba(124,45,45,0.08)] text-burgundy",
              )}
            >
              {result.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-cream">
          {isDone ? (
            <Button variant="primary" onClick={handleClose}>
              {result?.kind === "partial" ? "Tutup" : "Selesai"}
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={handleClose} disabled={submitting}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!file || submitting}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Mengimpor…" : "Import"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
