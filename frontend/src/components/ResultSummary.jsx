import React from "react";
import {
  ShieldCheck,
  TriangleAlert,
  BrainCircuit,
  CalendarDays,
  Sprout,
  Scissors,
  CloudSun,
  Printer,
  Download,
  Sparkles,
} from "lucide-react";
const icons = {
  planting: CalendarDays,
  growth: Sprout,
  harvest: Scissors,
  weather: CloudSun,
};
export default function ResultSummary({
  r,
  ui,
  user,
  plot,
  onPreview,
  onCsv,
  includeProfile,
  setIncludeProfile,
}) {
  const { t, n, date } = ui,
    score = r.reliabilityScore;
  const tone =
    score >= 85
      ? "good"
      : score >= 70
        ? "fair"
        : score >= 50
          ? "caution"
          : "danger";
  const mlTone = !r.mlResult.available
    ? "unknown"
    : r.mlResult.is_anomaly
      ? "caution"
      : "good";
  const StateIcon = mlTone === "good" ? ShieldCheck : TriangleAlert;
  return (
    <section className={"card assessment-card " + tone}>
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
      <div className="assessment-top">
        <div
          className="score-ring"
          role="meter"
          aria-label={t("score")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <circle className="ring-track" cx="80" cy="80" r="68" />
            <circle
              className="ring-value"
              cx="80"
              cy="80"
              r="68"
              pathLength="100"
              strokeDasharray={`${score} 100`}
            />
          </svg>
          <div>
            <strong>{n(score)}</strong>
            <span>
              {t("score")} / {n(100)}
            </span>
          </div>
        </div>
        <div className="assessment-intro">
          <span className={"assessment-status " + tone}>
            <ShieldCheck size={15} />
            {t(r.reliabilityCategory)}
          </span>
          <h2>{t("result")}</h2>
          <p className="crop-meta">
            {t(r.submission.crop)} · {t(r.submission.season)} ·{" "}
            {t(r.submission.district)}
            {r.submission.variety ? " · " + r.submission.variety : ""}
          </p>
          <div className="completeness">
            <span>{t("completeness")}</span>
            <progress
              max="100"
              value={r.assessmentCompleteness}
              aria-label={t("completeness")}
            />
            <strong>{n(r.assessmentCompleteness)}%</strong>
          </div>
        </div>
        <div className={"ml-pattern-card " + mlTone}>
          <div className="ml-card-heading">
            <BrainCircuit size={18} />
            <span>{t("ml")}</span>
          </div>
          <div className="ml-card-body">
            <StateIcon size={23} />
            <strong>
              {t(
                r.mlResult.available
                  ? r.mlResult.is_anomaly
                    ? "mlAnomaly"
                    : "mlNormal"
                  : "mlUnknown",
              )}
            </strong>
          </div>
          <p className="hint">
            {t("modelVersion")}: {r.mlResult.model_version || t("unavailable")}
          </p>
          <p className="hint">
            {t("anomalyScore")}: {n(r.mlResult.anomaly_score)}
          </p>
        </div>
      </div>
      <div className="parameter-heading">
        <Sparkles size={16} />
        <h3>{t("parameters")}</h3>
      </div>
      <div className="parameter-grid">
        {Object.entries(r.parameterScores).map(([key, value]) => {
          const Icon = icons[key] || Sprout;
          return (
            <div className={"parameter-card " + key} key={key}>
              <div className="parameter-name">
                <Icon size={17} />
                <span>{t(key)}</span>
                <strong>{value.weight ? n(value.score) + "%" : "—"}</strong>
              </div>
              <progress
                max="100"
                value={value.weight ? value.score : 0}
                aria-label={t(key)}
              />
              <div className="parameter-foot">
                <span>
                  {t("weight")}: {n(value.weight * 100)}%
                </span>
                <span>
                  {value.weight
                    ? t("contribution") + ": " + n(value.contribution)
                    : t("unavailable")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="score-disclaimer">
        <ShieldCheck size={15} />
        <span>{t("scoreNote")}</span>
      </p>
      {(!r.weatherAssessment.available || !r.mlResult.available) && (
        <p className="notice">{t("incompleteWeather")}</p>
      )}
      <div className="assessment-record hint">
        {t("id")}: {r.id}{" "}
        <span>
          · {t("createdAt")}: {date(r.createdAt)}
        </span>
      </div>
      <div className="actions report-actions no-print">
        <button className="primary" onClick={onPreview}>
          <Sparkles size={16} />
          {t("preview")}
        </button>
        <button onClick={() => window.print()}>
          <Printer size={16} />
          {t("print")}
        </button>
        <button onClick={onCsv}>
          <Download size={16} />
          {t("csv")}
        </button>
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
  );
}
