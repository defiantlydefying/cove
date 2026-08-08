"use client";

interface CoveSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function CoveSwitch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = "md",
  className = "",
}: CoveSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`cove-switch ${checked ? "is-checked" : ""} ${
        size === "sm" ? "is-small" : ""
      } ${className}`}
    >
      <span className="cove-switch-thumb" aria-hidden="true" />
    </button>
  );
}
