"use client";

// Controlled phone input with as-you-type Indonesian formatting (0… → +62 …).
// `onChange` receives the already-formatted string. Pair with normalizePhoneIntl
// on submit/send (it strips the formatting back to bare international digits).

import { formatPhoneId } from "@/lib/phone";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function PhoneInput({ value, onChange, id, className, placeholder, disabled }: PhoneInputProps) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(formatPhoneId(e.target.value))}
    />
  );
}
