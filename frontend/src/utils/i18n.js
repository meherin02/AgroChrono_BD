import locales from "../../../shared/locales.json";
export const dictionaries = locales;
export function useText(lang) {
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  return {
    lang,
    time: (v) =>
      v
        ? new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "UTC",
          }).format(new Date(v))
        : "—",
    t: (key) => locales[lang][key] || key,
    n: (v) =>
      v === null || v === undefined
        ? "—"
        : new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(v),
    date: (v) =>
      v
        ? new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(v))
        : "—",
    window: (w) =>
      typeof w === "object" && w
        ? new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(2000, w.startMonth - 1, w.startDay))) +
          " – " +
          new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          }).format(new Date(Date.UTC(2000, w.endMonth - 1, w.endDay)))
        : w || "—",
  };
}
export const normalizeDigits = (v) =>
  v.replace(/[০-৯]/g, (c) => "০১২৩৪৫৬৭৮৯".indexOf(c));
