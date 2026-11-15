import React from "react";
import DateInput from "./DateInput";
export const emptyCalendar = {
  crop: "Rice",
  season: "Aman",
  district: "Rangpur",
  variety: "",
  plotId: "",
  plantingStart: "",
  plantingEnd: "",
  growthStart: "",
  growthEnd: "",
  harvestStart: "",
  harvestEnd: "",
};
export const exampleCalendar = {
  ...emptyCalendar,
  variety: "BRRI dhan49",
  plantingStart: "2025-07-20",
  plantingEnd: "2025-07-30",
  growthStart: "2025-08-01",
  growthEnd: "2025-11-01",
  harvestStart: "2025-11-15",
  harvestEnd: "2025-11-30",
};
export default function CalendarForm({
  value,
  onChange,
  options,
  plots,
  onSubmit,
  busy,
  ui,
  revision = false,
}) {
  const { t } = ui,
    change = (key, v) => onChange({ ...value, [key]: v });
  return (
    <section className="card">
      <h2>{t(revision ? "revisionIntro" : "calendar")}</h2>
      <p className="muted">{t("formIntro")}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
      >
        <div className="form-grid">
          <label>
            {t("crop")}
            <select
              name="crop"
              value={value.crop}
              onChange={(e) => {
                const c = options.crops.find((c) => c.id === e.target.value);
                onChange({ ...value, crop: c.id, season: c.seasons[0] });
              }}
            >
              {options.crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("season")}
            <select
              name="season"
              value={value.season}
              onChange={(e) => change("season", e.target.value)}
            >
              {options.crops
                .find((c) => c.id === value.crop)
                ?.seasons.map((s) => (
                  <option key={s} value={s}>
                    {t(s)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {t("district")}
            <select
              name="district"
              value={value.district}
              onChange={(e) => change("district", e.target.value)}
            >
              {options.districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {t(d.name)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("variety")}
            <input
              name="variety"
              value={value.variety}
              maxLength={120}
              onChange={(e) => change("variety", e.target.value)}
            />
          </label>
          <label>
            {t("plot")}
            <select
              name="plotId"
              value={value.plotId || ""}
              onChange={(e) => change("plotId", e.target.value)}
            >
              <option value="">{t("noPlot")}</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="hint">{t("dateHint")}</p>
        <div className="stage-grid">
          {["planting", "growth", "harvest"].map((stage) => (
            <fieldset key={stage} className={"stage " + stage}>
              <legend>{t(stage)}</legend>
              {["Start", "End"].map((part) => (
                <label key={part}>
                  {t(part === "Start" ? "startDate" : "endDate")}
                  <DateInput
                    name={stage + part}
                    label={t(stage + part)}
                    value={value[stage + part]}
                    onChange={(v) => change(stage + part, v)}
                    ui={ui}
                    required
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </div>
        <div className="actions no-print">
          <button className="primary" disabled={busy} type="submit">
            {t(busy ? "saving" : revision ? "revisionSave" : "analyze")}
          </button>
          {!revision && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(exampleCalendar)}
              >
                {t("example")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onChange(emptyCalendar)}
              >
                {t("reset")}
              </button>
            </>
          )}
        </div>
        <p className="hint">{t("exampleNote")}</p>
      </form>
    </section>
  );
}
