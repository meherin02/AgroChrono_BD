import React from "react";
export default function AgronomicAdvisory({ result, ui }) {
  const { t, window, n } = ui,
    r = result.reference;
  return (
    <section className="card">
      <h2>{t("guidance")}</h2>
      <p>{t("guidanceNote")}</p>
      <p className="hint">{t("generalGuidance")}</p>
      <div className="stage-grid">
        <div>
          <h3>{t("planting")}</h3>
          <p>{window(r.plantingWindow)}</p>
        </div>
        <div>
          <h3>{t("growth")}</h3>
          <p>
            {n(r.growthDurationDays.min)}–{n(r.growthDurationDays.max)}{" "}
            {t("days")}
          </p>
        </div>
        <div>
          <h3>{t("harvest")}</h3>
          <p>{window(r.harvestWindow)}</p>
        </div>
      </div>
      <p>
        {t(r.crop)} · {t(r.season)} · {t(r.district)}
      </p>
      <a href={r.sourceUrl} target="_blank" rel="noreferrer">
        {r.sourceName}
      </a>
      <p className="hint">{t("sourceDisclaimer")}</p>
    </section>
  );
}
