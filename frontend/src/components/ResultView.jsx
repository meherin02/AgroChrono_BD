import React from "react";
import AgronomicAdvisory from "./AgronomicAdvisory";
export function ReferenceCard({ r, ui }) {
  const { t, n, window, date } = ui;
  return (
    <article className="reference-card">
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
    <section className="reference-card">
      <h3>{t("weather")}</h3>
      <p>
        {t(w.product || "unavailable")}
        {aged ? " · " + t("stale") : ""}
      </p>
      {!w.available && (
        <p className="notice">{t(w.reason || "incompleteWeather")}</p>
      )}
      <p>
        {t("mean")}: {n(w.meanTemperature)}
        {t("celsius")} · {t("rainfall")}: {n(w.totalRainfall)} {t("mm")}
      </p>
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
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("result")}</p>
            <h2>
              {t(s.crop)} · {t(s.season)} · {t(s.district)}
            </h2>
            <p>{s.variety}</p>
          </div>
          <div className="score">
            <strong>
              {n(r.reliabilityScore)}
              <small>/ {n(100)}</small>
            </strong>
            <span>{t(r.reliabilityCategory)}</span>
          </div>
        </div>
        <div className="print-only">
          <h1>{t("report")}</h1>
          {includeProfile && (
            <p>
              {user.displayName}
              {plot
                ? " · " +
                  plot.name +
                  (plot.area ? " · " + n(plot.area) + " " + t(plot.unit) : "")
                : ""}
            </p>
          )}
        </div>
        <p className="hint">
          {t("id")}: {r.id}
          <br />
          {t("createdAt")}: {date(r.createdAt)} · {t("completeness")}:{" "}
          {n(r.assessmentCompleteness)}%
        </p>
        <p className="notice">{t("scoreNote")}</p>
        <div className="metric-grid">
          {Object.entries(r.parameterScores).map(([k, v]) => (
            <div key={k}>
              <span>{t(k)}</span>
              <strong>
                {v.weight ? n(v.score) : "—"} <small>× {n(v.weight)}</small>
              </strong>
            </div>
          ))}
        </div>
        <p>
          {t("ml")}:{" "}
          <strong>
            {t(
              r.mlResult.available
                ? r.mlResult.is_anomaly
                  ? "mlAnomaly"
                  : "mlNormal"
                : "mlUnknown",
            )}
          </strong>
        </p>
        <p className="hint">
          {t("modelVersion")}: {r.mlResult.model_version || "—"} ·{" "}
          {t("anomalyScore")}: {n(r.mlResult.anomaly_score)}
        </p>
        {(!r.weatherAssessment.available || !r.mlResult.available) && (
          <p className="notice">{t("incompleteWeather")}</p>
        )}
        <div className="actions no-print">
          <button onClick={onPreview}>{t("preview")}</button>
          <button onClick={() => window.print()}>{t("print")}</button>
          <button onClick={onCsv}>{t("csv")}</button>
          <label className="check">
            <input
              type="checkbox"
              checked={includeProfile}
              onChange={(e) => setIncludeProfile(e.target.checked)}
            />
            {t("includeProfile")}
          </label>
        </div>
      </section>
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
      <section className="card">
        <h2>{t("stage")}</h2>
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
                  <tr>
                    <td colSpan={5} className="hint">
                      {t(
                        c.status === "Unavailable"
                          ? "incompleteWeather"
                          : c.status === "Compatible"
                            ? "compatibleExplanation"
                            : "conflictExplanation",
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
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
      <WeatherView w={r.weatherAssessment} ui={ui} />
      <AgronomicAdvisory result={r} ui={ui} />
      <section className="card">
        <h2>{t("referenceInfo")}</h2>
        <ReferenceCard r={r.reference} ui={ui} />
      </section>
    </div>
  );
}
