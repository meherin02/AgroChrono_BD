import React from "react";
import { CalendarDays } from "lucide-react";
import { normalizeDigits } from "../utils/i18n";

export default function DateInput({
  name,
  label,
  value = "",
  onChange,
  ui,
  required = false,
  disabled = false,
}) {
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
  const display =
    ui.lang === "bn" ? value.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]) : value;
  function openPicker(event) {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      /* Browsers without showPicker still have their native indicator. */
    }
  }
  return (
    <span className="date-input">
      <input
        name={name}
        aria-label={label}
        type="text"
        inputMode="text"
        placeholder={ui.lang === "bn" ? "২০২৬-০৭-২০" : "YYYY-MM-DD"}
        required={required}
        disabled={disabled}
        maxLength={10}
        value={display}
        onChange={(event) => onChange(normalizeDigits(event.target.value))}
      />
      <span className="date-input-picker">
        <CalendarDays size={19} aria-hidden="true" />
        <input
          type="date"
          lang={ui.lang === "bn" ? "bn-BD" : "en-GB"}
          aria-label={ui.t("chooseDate") + ": " + label}
          title={ui.t("chooseDate")}
          disabled={disabled}
          value={valid ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          onClick={openPicker}
        />
      </span>
    </span>
  );
}
