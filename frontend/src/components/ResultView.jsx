import React from "react";
import AgronomicAdvisory from "./AgronomicAdvisory";
import ResultSummary from "./ResultSummary";
import {
  CloudSun,
  Thermometer,
  Droplets,
  ShieldCheck,
  TriangleAlert,
  BookOpen,
} from "lucide-react";
export function ReferenceCard({ r, ui }) {
  const { t, n, window, date } = ui;
  return (
    <article className="reference-card crop-reference">
      <h3>
        {t(r.crop)} · {t(r.season)}
      </h3>
      <p>
        {t(r.district)} · {r.varieties.join(", ")}
      </p>
      <dl>
        <dt>{t("planting")}</dt>
        <dd>{window(r.plantingWindow)}</dd>
        <dt>{t("growth")}</dt>
        <dd>
          {n(r.growthDurationDays.min)}–{n(r.growthDurationDays.max)}{" "}
          {t("days")}
        </dd>
        <dt>{t("harvest")}</dt>
        <dd>{window(r.harvestWindow)}</dd>
        <dt>{t("threshold")}</dt>
        <dd>
          {n(r.temperatureRange.min)}–{n(r.temperatureRange.max)}
          {t("celsius")} · {n(r.rainfallRequirementMm.min)}–
          {n(r.rainfallRequirementMm.max)} {t("mm")}
        </dd>
      </dl>
      <a href={r.sourceUrl} target="_blank" rel="noreferrer">
        {r.sourceName}
      </a>
      <p className="hint">
        {t("sourceDate")}: {date(r.lastUpdated)}
      </p>
      <p className="hint">{t("sourceDisclaimer")}</p>
    </article>
  );
}
export function WeatherView({ w, ui }) {
  const { t, n, date } = ui;
  const aged =
    w.stale ||
    (w.product === "forecast" &&
      w.retrievedAt &&
      Date.now() - Date.parse(w.retrievedAt) > 30 * 60000);
  return (
    <section className="reference-card weather-panel">
      <div className="panel-heading">
        <span className="weather-icon">
          <CloudSun size={24} />
        </span>
        <div>
          <h3>{t("weather")}</h3>
          <span className="hint">{t("source")}</span>
        </div>
      </div>
      <p>
        {t(w.product || "unavailable")}
        {aged ? " · " + t("stale") : ""}
      </p>
      {!w.available && (
        <p className="notice">{t(w.reason || "incompleteWeather")}</p>
      )}
      <div className="weather-metrics">
        <div>
          <span>
            <Thermometer size={16} />
            {t("mean")}
          </span>
          <strong>
            {n(w.meanTemperature)}
            <small>{t("celsius")}</small>
          </strong>
        </div>
        <div>
          <span>
            <Droplets size={16} />
            {t("rainfall")}
          </span>
          <strong>
            {n(w.totalRainfall)} <small>{t("mm")}</small>
          </strong>
        </div>
      </div>
      <p className="hint">
        {t("coverage")}: {date(w.coverageStart)} – {date(w.coverageEnd)} ·{" "}
        {n(w.completeDays)} / {n(w.expectedDays)} {t("days")}
      </p>
      <p className="hint">
        {t("retrievedAt")}: {date(w.retrievedAt)} {ui.time(w.retrievedAt)} UTC
      </p>
      {w.sourceUrl && (
        <a href={w.sourceUrl} target="_blank" rel="noreferrer">
          {w.dataSource}
        </a>
      )}
    </section>
  );
}
function values(r, c, ui) {
  const { date, n, t, window } = ui,
    s = r.submission,
    ref = r.reference;
  if (c.field === "Planting Window")
    return [
      date(s.plantingStart) + " – " + date(s.plantingEnd),
      window(ref.plantingWindow),
    ];
  if (c.field === "Harvest Window")
    return [
      date(s.harvestStart) + " – " + date(s.harvestEnd),
      window(ref.harvestWindow),
    ];
  if (c.field === "Growth Duration")
    return [
      n(r.mlFeatures.growth_days) + " " + t("days"),
      n(ref.growthDurationDays.min) +
        "–" +
        n(ref.growthDurationDays.max) +
        " " +
        t("days"),
    ];
  return [
    r.weatherAssessment.available
      ? n(r.weatherAssessment.meanTemperature) +
        t("celsius") +
        " / " +
        n(r.weatherAssessment.totalRainfall) +
        " " +
        t("mm")
      : t("unavailable"),
    n(ref.temperatureRange.optimalMin) +
      "–" +
      n(ref.temperatureRange.optimalMax) +
      t("celsius"),
  ];
}
export default function ResultView({
  result: r,
  ui,
  onActivity,
  onPreview,
  onOpen,
  parent,
  user,
  plot,
  includeProfile,
  setIncludeProfile,
  onCsv,
}) {
  const { t, n, date } = ui,
    s = r.submission,
    start = Date.parse(s.plantingStart),
    span = Math.max(1, Date.parse(s.harvestEnd) - start);
  return (
    <div className="report" id="assessment-report">
      <ResultSummary
        r={r}
        ui={ui}
        user={user}
        plot={plot}
        onPreview={onPreview}
        onCsv={onCsv}
        includeProfile={includeProfile}
        setIncludeProfile={setIncludeProfile}
      />
      <section className="card suggested-dates">
        <h2>{t("suggestedDates")}</h2>
        <p className="hint">{t("revisionIntro")}</p>
        <div className="stage-grid">
          {["planting", "growth", "harvest"].map((stage) => (
            <div key={stage}>
              <h3>{t(stage)}</h3>
              <p>
                {date(r.suggestedCalendar[stage + "Start"])} –{" "}
                {date(r.suggestedCalendar[stage + "End"])}
              </p>
            </div>
          ))}
        </div>
      </section>
      {r.parentId && (
        <section className="card">
          <h2>{t("comparison")}</h2>
          <p className="hint">
            {t("revisionId")}: {r.parentId} → {r.id}
          </p>
          <button className="no-print" onClick={() => onOpen(r.parentId)}>
            {t("original")}
          </button>
          <p>
            {t("change")}:{" "}
            <strong>
              {r.comparison.scoreImprovement > 0 ? "+" : ""}
              {n(r.comparison.scoreImprovement)}
            </strong>
          </p>
          {r.comparison.sourceChanged && (
            <p className="notice">{t("sourceChanged")}</p>
          )}
          <div className="stage-grid">
            {["planting", "growth", "harvest"].map((stage) => (
              <div key={stage}>
                <h3>{t(stage)}</h3>
                <p>
                  {t("original")}: {date(parent?.submission[stage + "Start"])} –{" "}
                  {date(parent?.submission[stage + "End"])}
                </p>
                <p>
                  {t("revised")}: {date(s[stage + "Start"])} –{" "}
                  {date(s[stage + "End"])}
                </p>
              </div>
            ))}
          </div>
          <p>
            {t("original")}: {n(r.comparison.originalScore)} → {t("revised")}:{" "}
            {n(r.comparison.newScore)}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("stage")}</th>
                  <th>{t("original")}</th>
                  <th>{t("revised")}</th>
                </tr>
              </thead>
              <tbody>
                {r.conflicts.map((c) => (
                  <tr key={c.field}>
                    <th>{t(c.field)}</th>
                    <td>
                      {t(
                        parent?.conflicts.find((v) => v.field === c.field)
                          ?.status || "Unavailable",
                      )}
                    </td>
                    <td>{t(c.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="card conflict-card">
        <div className="section-head">
          <div className="panel-heading">
            <span className="heading-icon">
              <ShieldCheck size={22} />
            </span>
            <h2>{t("stage")}</h2>
          </div>
          <span className="issue-count">
            {n(
              r.conflicts.filter(
                (c) => c.status !== "Compatible" && c.status !== "Unavailable",
              ).length,
            )}{" "}
            {t("flaggedFields")}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["stage", "submitted", "reference", "status", "deviation"].map(
                  (k) => (
                    <th key={k}>{t(k)}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {r.conflicts.map((c) => (
                <React.Fragment key={c.field}>
                  <tr>
                    <th scope="row">{t(c.field)}</th>
                    {values(r, c, ui).map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                    <td>
                      <span className={"badge " + c.severity}>
                        {t(c.status)}
                      </span>
                    </td>
                    <td>{n(c.deviationDays)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="conflict-explanations">
          <h3>{t("explanation")}</h3>
          {r.conflicts.map((c) => (
            <article
              className={"field-explanation " + c.severity}
              key={c.field}
            >
              <div>
                <span className="field-icon">
                  {c.status === "Compatible" ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <TriangleAlert size={18} />
                  )}
                </span>
                <strong>{t(c.field)}</strong>
                <span className={"badge " + c.severity}>{t(c.status)}</span>
              </div>
              <p>
                {t(
                  c.status === "Unavailable"
                    ? "incompleteWeather"
                    : c.status === "Compatible"
                      ? "compatibleExplanation"
                      : "conflictExplanation",
                )}{" "}
                {c.deviationDays > 0 ? (
                  <>
                    <strong>
                      {t("deviation")}: {n(c.deviationDays)}
                    </strong>
                    .{" "}
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </div>
        <p className="hint">{t("coverageNote")}</p>
        <div className="timeline">
          {["planting", "growth", "harvest"].map((stage) => (
            <div key={stage}>
              <span>
                {t(stage)} · {date(s[stage + "Start"])} –{" "}
                {date(s[stage + "End"])}
              </span>
              <div className="track">
                <div
                  className={"bar " + stage}
                  style={{
                    marginLeft:
                      ((Date.parse(s[stage + "Start"]) - start) / span) * 100 +
                      "%",
                    width:
                      Math.max(
                        1,
                        ((Date.parse(s[stage + "End"]) -
                          Date.parse(s[stage + "Start"])) /
                          span) *
                          100,
                      ) + "%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>{t("upcoming")}</h2>
        {r.activities.map((a) => (
          <div className="activity" key={a.id}>
            <div>
              <strong>{t(a.stage)}</strong>
              <p>
                {date(a.start)} – {date(a.end)} ·{" "}
                {t(a.complete ? "completed" : "pending")}
              </p>
            </div>
            <button
              className="no-print"
              onClick={() => onActivity(r.id, a.id, !a.complete)}
            >
              {t(a.complete ? "reopen" : "complete")}
            </button>
          </div>
        ))}
      </section>
      <div className="evidence-grid">
        <WeatherView w={r.weatherAssessment} ui={ui} />
        <section className="card reference-panel">
          <div className="panel-heading">
            <span className="heading-icon">
              <BookOpen size={22} />
            </span>
            <h2>{t("referenceInfo")}</h2>
          </div>
          <ReferenceCard r={r.reference} ui={ui} />
        </section>
      </div>
      <AgronomicAdvisory result={r} ui={ui} />
    </div>
  );
}
