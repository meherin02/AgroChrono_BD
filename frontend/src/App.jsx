import React, { useState, useEffect, useRef } from "react";
import {
  Sprout,
  LayoutDashboard,
  CalendarDays,
  Bell,
  BookOpen,
  UserRound,
  History,
  Globe,
  LogOut,
} from "lucide-react";
import CalendarForm, { emptyCalendar } from "./components/CalendarForm";
import ResultView, {
  ReferenceCard,
  WeatherView,
} from "./components/ResultView";
import { useText, normalizeDigits } from "./utils/i18n";
import { readHttp } from "./utils/request";
import DateInput from "./components/DateInput";
const safeDraft = (owner) => {
  if (!owner) return { ...emptyCalendar };
  try {
    return {
      ...emptyCalendar,
      ...JSON.parse(localStorage.getItem("agro-draft:" + owner) || "{}"),
    };
  } catch {
    return emptyCalendar;
  }
};
export default function App() {
  const [lang, setLang] = useState(
      localStorage.getItem("agro-language") === "en" ? "en" : "bn",
    ),
    ui = useText(lang),
    { t, n, date } = ui;
  const [auth, setAuth] = useState(null),
    [ready, setReady] = useState(false),
    [options, setOptions] = useState({
      crops: [],
      districts: [],
      references: [],
    }),
    [tab, setTab] = useState("dashboard"),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [plots, setPlots] = useState([]),
    [dash, setDash] = useState(null),
    [history, setHistory] = useState({
      data: [],
      page: 1,
      total: 0,
      limit: 10,
    }),
    [notifications, setNotifications] = useState([]),
    [products, setProducts] = useState([]),
    [form, setForm] = useState(safeDraft),
    [result, setResult] = useState(null),
    [parent, setParent] = useState(null),
    [revision, setRevision] = useState(null),
    [includeProfile, setIncludeProfile] = useState(false),
    [query, setQuery] = useState({
      search: "",
      crop: "",
      district: "",
      status: "",
      date: "",
    }),
    [authMode, setAuthMode] = useState("login"),
    [account, setAccount] = useState({
      password: "",
      displayName: "",
    }),
    [profile, setProfile] = useState(null),
    [plot, setPlot] = useState({
      name: "",
      area: "",
      unit: "ha",
      district: "Rangpur",
    }),
    [message, setMessage] = useState(false);
  useEffect(() => {
    if (error) document.querySelector("[role=alert]")?.focus();
  }, [error]);
  const authRef = useRef(null),
    draftOwner = useRef(null),
    historyEpoch = useRef(0),
    selection = useRef(0),
    inFlight = useRef(false),
    retryKey = useRef(null),
    retryAction = useRef(null);
  async function api(path, method = "GET", body, key) {
    const { response, data } = await readHttp("/api" + path, {
      method,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "AgroChrono",
        ...(authRef.current?.csrf
          ? { "X-CSRF-Token": authRef.current.csrf }
          : {}),
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      if (response.status === 401 && authRef.current) {
        setSession(null);
        selection.current++;
      }
      throw {
        code: data.error || "SERVICE_UNAVAILABLE",
        details: data.details,
      };
    }
    return data;
  }
  function setSession(v) {
    const owner = v?.user?.id || null;
    if (draftOwner.current !== owner) {
      draftOwner.current = owner;
      selection.current++;
      historyEpoch.current++;
      setResult(null);
      setParent(null);
      setRevision(null);
      setDash(null);
      setPlots([]);
      setNotifications([]);
      setProducts([]);
      setHistory({ data: [], page: 1, total: 0, limit: 10 });
      setQuery({ search: "", crop: "", district: "", status: "", date: "" });
      setPlot({ name: "", area: "", unit: "ha", district: "Rangpur" });
      setIncludeProfile(false);
      retryKey.current = null;
      retryAction.current = null;
      const draft = safeDraft(owner);
      if (v?.user.defaultDistrict && !draft.plantingStart)
        draft.district = v.user.defaultDistrict;
      setForm(draft);
      setTab("dashboard");
    }
    authRef.current = v;
    setAuth(v);
    setProfile(v?.user || null);
    if (v?.user.language) setLang(v.user.language);
  }
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("brand");
    localStorage.setItem("agro-language", lang);
  }, [lang]);
  useEffect(() => {
    if (draftOwner.current) {
      try {
        localStorage.setItem(
          "agro-draft:" + draftOwner.current,
          JSON.stringify(form),
        );
      } catch {
        /* Keep the controlled in-memory draft if browser storage is full. */
      }
    }
  }, [form]);
  async function start() {
    try {
      const [o, s] = await Promise.all([api("/options"), api("/auth/session")]);
      setOptions(o);
      setSession(s.user ? s : null);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    start();
  }, []);
  async function loadHistory(page = 1) {
    const epoch = ++historyEpoch.current,
      owner = authRef.current?.user.id;
    const value = await api(
      "/history?" + new URLSearchParams({ ...query, page }),
    );
    if (epoch === historyEpoch.current && owner === authRef.current?.user.id)
      setHistory(value);
  }
  async function loadPrivate() {
    if (!authRef.current) return;
    const owner = authRef.current.user.id;
    const [d, p, alerts] = await Promise.all([
      api("/dashboard"),
      api("/plots"),
      api("/notifications"),
    ]);
    if (owner === authRef.current?.user.id) {
      setDash(d);
      setPlots(p);
      setNotifications(alerts);
    }
  }
  useEffect(() => {
    if (auth) loadPrivate().catch(setError);
  }, [auth?.user.id]);
  useEffect(() => {
    if (auth && tab === "history") loadHistory().catch(setError);
  }, [tab, query, auth?.user.id]);
  async function perform(fn) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setMessage(false);
    retryAction.current = fn;
    try {
      await fn();
      retryAction.current = null;
    } catch (e) {
      setError(e.code ? e : { code: "SERVICE_UNAVAILABLE" });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  async function open(id) {
    const epoch = ++selection.current;
    setTab("result");
    setRevision(null);
    await perform(async () => {
      const r = (await api("/results/" + id)).data;
      const p = r.parentId ? (await api("/results/" + r.parentId)).data : null;
      if (epoch === selection.current) {
        setResult(r);
        setParent(p);
        window.history.replaceState({}, "", "/#result/" + id);
      }
    });
  }
  useEffect(() => {
    const handler = () => {
      if (authRef.current && location.hash.startsWith("#result/"))
        open(location.hash.slice(8));
      else if (
        authRef.current &&
        [
          "dashboard",
          "calendar",
          "history",
          "alerts",
          "references",
          "profile",
        ].includes(location.hash.slice(1))
      )
        setTab(location.hash.slice(1));
    };
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [auth?.user.id]);
  async function submit(value) {
    const epoch = ++selection.current;
    const body = revision
      ? { correctedCalendar: value, originalResultId: revision }
      : value;
    const fingerprint = JSON.stringify(body);
    if (retryKey.current?.fingerprint !== fingerprint)
      retryKey.current = { fingerprint, key: crypto.randomUUID() };
    await perform(async () => {
      const r = (
        await api(
          revision ? "/reanalyze" : "/analyze",
          "POST",
          body,
          retryKey.current.key,
        )
      ).data;
      const p = r.parentId ? (await api("/results/" + r.parentId)).data : null;
      if (epoch === selection.current) {
        setResult(r);
        setParent(p);
        setTab("result");
        setRevision(null);
        window.history.replaceState({}, "", "/#result/" + r.id);
      }
      retryKey.current = null;
      await loadPrivate();
    });
  }
  async function activity(id, stage, complete) {
    await perform(async () => {
      const r = (
        await api("/results/" + id + "/activities/" + stage, "PATCH", {
          complete,
        })
      ).data;
      if (result?.id === id) setResult(r);
      await loadPrivate();
    });
  }
  async function language() {
    const next = lang === "bn" ? "en" : "bn",
      owner = authRef.current?.user.id;
    setLang(next);
    if (owner)
      try {
        const user = await api("/profile", "PATCH", { language: next });
        if (owner === authRef.current?.user.id)
          setSession({ ...authRef.current, user });
      } catch (e) {
        setError(e);
      }
  }
  async function csv() {
    await perform(async () => {
      const { response, data: blob } = await readHttp(
        "/api/results/" +
          result.id +
          "/report.csv?lang=" +
          lang +
          "&includeProfile=" +
          includeProfile,
        { credentials: "same-origin" },
        { format: "blob" },
      );
      if (!response.ok) throw { code: "SERVICE_UNAVAILABLE" };
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `agrochrono-${result.id}-${lang}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  const nav = [
    ["dashboard", LayoutDashboard],
    ["calendar", CalendarDays],
    ["history", History],
    ["alerts", Bell],
    ["references", BookOpen],
    ["profile", UserRound],
  ];
  function navigate(key) {
    selection.current++;
    setTab(key);
    setRevision(null);
    setError(null);
    retryAction.current = null;
    window.history.replaceState({}, "", "/#" + key);
  }
  const alertBox = error && (
    <div className="error no-print" role="alert" tabIndex={-1}>
      <strong>{t(error.code || "SERVICE_UNAVAILABLE")}</strong>
      {error.details?.map((v, i) => (
        <p key={i}>
          {t(v.field || "calendar")}: {t(v.code)}
        </p>
      ))}
      <button
        disabled={busy}
        onClick={() => {
          if (retryAction.current) return perform(retryAction.current);
          if (!authRef.current) return start();
          return perform(() =>
            tab === "history" ? loadHistory(history.page) : loadPrivate(),
          );
        }}
      >
        {t("retry")}
      </button>
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#main">
        {t("open")}
      </a>
      <header className="topbar no-print">
        <a
          className="brand"
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            navigate("dashboard");
          }}
        >
          <span>
            <Sprout size={24} />
          </span>
          {t("brand")}
        </a>
        <div className="actions">
          <button
            disabled={busy}
            onClick={language}
            aria-label={lang === "bn" ? "Switch to English" : "বাংলায় পড়ুন"}
          >
            <Globe size={16} />
            {lang === "bn" ? "English" : "বাংলা"}
          </button>
          {auth && (
            <button
              disabled={busy}
              onClick={() =>
                perform(async () => {
                  await api("/auth/logout", "POST", {});
                  setSession(null);
                  setResult(null);
                  setDash(null);
                  setNotifications([]);
                  selection.current++;
                  window.history.replaceState({}, "", "/");
                })
              }
            >
              <LogOut size={16} />
              {t("logout")}
            </button>
          )}
        </div>
      </header>
      {!ready ? (
        <main id="main" className="shell">
          <p role="status">{t("loading")}</p>
        </main>
      ) : !auth ? (
        <main id="main" className="auth-layout">
          <section className="welcome">
            <div className="eyebrow">{t("brand")}</div>
            <h1>{t("tagline")}</h1>
            <p>{t("authIntro")}</p>
            <div className="welcome-art">
              <Sprout size={100} strokeWidth={1} />
            </div>
            <p className="hint">{t("privacy")}</p>
          </section>
          <section className="card auth-card">
            <h2>{t(authMode)}</h2>
            {alertBox}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                perform(async () => {
                  const body = {
                    displayName: account.displayName,
                    password: account.password,
                    ...(authMode === "register"
                      ? { displayName: account.displayName, language: lang }
                      : {}),
                  };
                  const s = await api("/auth/" + authMode, "POST", body);
                  setSession(s);
                  setAccount({ password: "", displayName: "" });
                });
              }}
            >
              <label>
                {t("displayName")}
                <input
                  name="displayName"
                  autoComplete={authMode === "register" ? "name" : "username"}
                  required
                  minLength={2}
                  maxLength={100}
                  value={account.displayName}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      displayName: e.target.value.normalize("NFC"),
                    })
                  }
                />
              </label>
              <label>
                {t("password")}
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    authMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  required
                  minLength={10}
                  maxLength={128}
                  value={account.password}
                  onChange={(e) =>
                    setAccount({ ...account, password: e.target.value })
                  }
                />
              </label>
              <button className="primary" disabled={busy}>
                {t(busy ? "saving" : authMode)}
              </button>
            </form>
            <button
              className="link"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {t(authMode === "login" ? "register" : "login")}
            </button>
          </section>
        </main>
      ) : (
        <div className="app-layout">
          <aside className="sidebar no-print">
            <p className="eyebrow">{auth.user.displayName}</p>
            <nav aria-label={t("dashboard")}>
              {nav.map(([key, Icon]) => (
                <button
                  key={key}
                  aria-current={tab === key ? "page" : undefined}
                  disabled={busy}
                  onClick={() => navigate(key)}
                >
                  <Icon size={18} />
                  {t(key)}
                  {key === "alerts" && notifications.length > 0 && (
                    <span className="count">{n(notifications.length)}</span>
                  )}
                </button>
              ))}
            </nav>
            <p className="hint">{t("privacy")}</p>
          </aside>
          <main id="main" className="main-content">
            <div className="page-heading no-print">
              <div>
                <p className="eyebrow">{t("brand")}</p>
                <h1>{t(tab === "result" ? "result" : tab)}</h1>
              </div>
              {busy && <p role="status">{t("saving")}</p>}
            </div>
            {alertBox}
            {message && (
              <p role="status" className="notice no-print">
                {t("savedMessage")}
              </p>
            )}
            {tab === "dashboard" && (
              <>
                <div className="metric-grid dashboard-metrics">
                  {[
                    ["saved", dash?.count],
                    ["incomplete", dash?.incomplete],
                    ["alerts", dash?.activeAlerts],
                    ["revisions", dash?.revisions],
                  ].map(([k, v]) => (
                    <section className="card" key={k}>
                      <span>{t(k)}</span>
                      <strong>{n(v)}</strong>
                    </section>
                  ))}
                </div>
                <section className="card">
                  <div className="section-head">
                    <h2>{t("upcoming")}</h2>
                    <button
                      className="primary"
                      onClick={() => navigate("calendar")}
                    >
                      {t("calendar")}
                    </button>
                  </div>
                  {dash?.activities.length ? (
                    dash.activities.map((a) => (
                      <div className="activity" key={a.resultId + a.id}>
                        <div>
                          <strong>
                            {t(a.stage)} · {t(a.crop)}
                          </strong>
                          <p>
                            {date(a.start)} – {date(a.end)}
                          </p>
                        </div>
                        <div className="actions">
                          <button
                            disabled={busy}
                            onClick={() => open(a.resultId)}
                          >
                            {t("open")}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => activity(a.resultId, a.id, true)}
                          >
                            {t("complete")}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>{t("empty")}</p>
                  )}
                </section>
                {dash?.overlaps.map((o) => (
                  <p className="notice" key={o.first + o.second}>
                    {t("overlap")}{" "}
                    <button onClick={() => open(o.first)}>{t("open")}</button>
                  </p>
                ))}
                <section className="card">
                  <h2>{t("recent")}</h2>
                  {dash?.recent.map((r) => (
                    <button
                      className="history-row"
                      key={r.id}
                      onClick={() => open(r.id)}
                    >
                      <span>
                        {t(r.submission.crop)} · {t(r.submission.district)}
                        <small>{date(r.createdAt)}</small>
                      </span>
                      <strong>{n(r.reliabilityScore)}</strong>
                    </button>
                  ))}
                  {!dash?.recent.length && <p>{t("empty")}</p>}
                </section>
              </>
            )}
            {tab === "dashboard" && dash?.recentRevisions?.length > 0 && (
              <section className="card">
                <h2>{t("recentRevisions")}</h2>
                {dash.recentRevisions.map((r) => (
                  <button
                    className="history-row"
                    key={r.id}
                    onClick={() => open(r.id)}
                  >
                    <span>
                      {t(r.submission.crop)} · {t(r.submission.district)}
                      <small>{date(r.createdAt)}</small>
                    </span>
                    <strong>{n(r.reliabilityScore)}</strong>
                  </button>
                ))}
              </section>
            )}
            {tab === "calendar" && (
              <CalendarForm
                value={form}
                onChange={setForm}
                options={options}
                plots={plots}
                onSubmit={submit}
                busy={busy}
                ui={ui}
                revision={!!revision}
              />
            )}
            {tab === "result" && result && (
              <ResultView
                result={result}
                parent={parent}
                user={auth.user}
                plot={
                  result.plotSnapshot ||
                  plots.find((p) => p.id === result.submission.plotId)
                }
                ui={ui}
                onOpen={open}
                onActivity={activity}
                onPreview={() => {
                  setForm(
                    Object.fromEntries(
                      Object.keys(emptyCalendar).map((k) => [
                        k,
                        result.suggestedCalendar[k] || emptyCalendar[k],
                      ]),
                    ),
                  );
                  setRevision(result.id);
                  setTab("calendar");
                }}
                includeProfile={includeProfile}
                setIncludeProfile={setIncludeProfile}
                onCsv={csv}
              />
            )}
            {tab === "history" && (
              <section className="card">
                <div className="form-grid">
                  <label>
                    {t("search")}
                    <input
                      value={query.search}
                      onChange={(e) =>
                        setQuery({ ...query, search: e.target.value })
                      }
                    />
                  </label>
                  {["crop", "district"].map((key) => (
                    <label key={key}>
                      {t(key)}
                      <select
                        value={query[key]}
                        onChange={(e) =>
                          setQuery({ ...query, [key]: e.target.value })
                        }
                      >
                        <option value="">{t("all")}</option>
                        {(key === "crop"
                          ? options.crops.map((c) => c.id)
                          : options.districts.map((d) => d.name)
                        ).map((v) => (
                          <option key={v} value={v}>
                            {t(v)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <label>
                    {t("status")}
                    <select
                      value={query.status}
                      onChange={(e) =>
                        setQuery({ ...query, status: e.target.value })
                      }
                    >
                      <option value="">{t("all")}</option>
                      {[
                        "High Reliability",
                        "Moderate Reliability",
                        "Marginal Reliability",
                        "Unreliable Timeline",
                      ].map((v) => (
                        <option value={v} key={v}>
                          {t(v)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("createdAt")}
                    <DateInput
                      name="historyDate"
                      label={t("createdAt")}
                      value={query.date}
                      onChange={(v) => setQuery({ ...query, date: v })}
                      ui={ui}
                    />
                  </label>
                </div>
                {history.data.map((r) => (
                  <button
                    className="history-row"
                    key={r.id}
                    onClick={() => open(r.id)}
                  >
                    <span>
                      {t(r.submission.crop)} · {t(r.submission.district)}
                      <small>
                        {date(r.createdAt)} · {t(r.reliabilityCategory)}
                        {r.parentId ? " · " + t("revised") : ""}
                      </small>
                    </span>
                    <strong>{n(r.reliabilityScore)}</strong>
                  </button>
                ))}
                {!history.data.length && <p>{t("empty")}</p>}
                <div className="actions">
                  <button
                    disabled={history.page <= 1}
                    onClick={() =>
                      loadHistory(history.page - 1).catch(setError)
                    }
                  >
                    {t("previous")}
                  </button>
                  <span>
                    {t("page")} {n(history.page)}
                  </span>
                  <button
                    disabled={history.page * history.limit >= history.total}
                    onClick={() =>
                      loadHistory(history.page + 1).catch(setError)
                    }
                  >
                    {t("next")}
                  </button>
                </div>
              </section>
            )}
            {tab === "alerts" && (
              <>
                <section className="card">
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() =>
                      perform(async () => {
                        const r = await api("/weather/refresh", "POST", {});
                        setProducts(r.products);
                        await loadPrivate();
                      })
                    }
                  >
                    {t("refresh")}
                  </button>
                  <p className="hint">{t("alertMeaning")}</p>
                </section>
                {notifications.map((a) => (
                  <section className="card" key={a.id}>
                    <h2>
                      {t(a.crop)} · {t(a.district)} · {t(a.stage)}
                    </h2>
                    <p>
                      {date(a.date)} · {t(a.read ? "readState" : "unread")}
                    </p>
                    <p>
                      {t("threshold")}: {n(a.threshold.min)}–
                      {n(a.threshold.max)}
                      {t("celsius")} · {t("minimum")}: {n(a.day.min)}
                      {t("celsius")} · {t("maximum")}: {n(a.day.max)}
                      {t("celsius")}
                    </p>
                    <WeatherView w={a.weather} ui={ui} />
                    <div className="actions">
                      <button onClick={() => open(a.resultId)}>
                        {t("open")}
                      </button>
                      {!a.read && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            perform(async () => {
                              await api("/notifications/" + a.id, "PATCH", {
                                read: true,
                              });
                              await loadPrivate();
                            })
                          }
                        >
                          {t("read")}
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() =>
                          perform(async () => {
                            await api("/notifications/" + a.id, "PATCH", {
                              dismissed: true,
                            });
                            await loadPrivate();
                          })
                        }
                      >
                        {t("dismiss")}
                      </button>
                    </div>
                  </section>
                ))}
                {products.map((w) => (
                  <WeatherView key={w.resultId} w={w} ui={ui} />
                ))}
                {!notifications.length && !products.length && (
                  <p>{t("noForecast")}</p>
                )}
              </>
            )}
            {tab === "references" && (
              <section className="reference-grid">
                {options.references.map((r) => (
                  <ReferenceCard key={r.id} r={r} ui={ui} />
                ))}
              </section>
            )}
            {tab === "profile" && profile && (
              <>
                <section className="card">
                  <h2>{t("profile")}</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      perform(async () => {
                        const {
                          displayName,
                          language,
                          defaultDistrict,
                          phone,
                          contactConsent,
                        } = profile;
                        const user = await api("/profile", "PATCH", {
                          displayName,
                          language,
                          defaultDistrict,
                          phone,
                          contactConsent,
                        });
                        setSession({ ...authRef.current, user });
                        setMessage(true);
                      });
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        {t("displayName")}
                        <input
                          required
                          maxLength={100}
                          value={profile.displayName}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              displayName: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        {t("defaultDistrict")}
                        <select
                          value={profile.defaultDistrict}
                          onChange={(e) => {
                            setProfile({
                              ...profile,
                              defaultDistrict: e.target.value,
                            });
                            setForm({ ...form, district: e.target.value });
                          }}
                        >
                          <option value="">{t("all")}</option>
                          {options.districts.map((d) => (
                            <option key={d.id} value={d.name}>
                              {t(d.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {t("preferredLanguage")}
                        <select
                          value={profile.language}
                          onChange={(e) =>
                            setProfile({ ...profile, language: e.target.value })
                          }
                        >
                          <option value="bn">বাংলা</option>
                          <option value="en">English</option>
                        </select>
                      </label>
                      <label>
                        {t("phone")}
                        <input
                          value={profile.phone}
                          maxLength={20}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={profile.contactConsent}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            contactConsent: e.target.checked,
                            phone: e.target.checked ? profile.phone : "",
                          })
                        }
                      />
                      {t("contactConsent")}
                    </label>
                    <button className="primary" disabled={busy}>
                      {t("save")}
                    </button>
                  </form>
                </section>
                <section className="card">
                  <h2>{t("addPlot")}</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      perform(async () => {
                        await api("/plots", "POST", {
                          ...plot,
                          area: plot.area
                            ? Number(normalizeDigits(plot.area))
                            : null,
                        });
                        setPlot({ ...plot, name: "", area: "" });
                        await loadPrivate();
                      });
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        {t("plotName")}
                        <input
                          required
                          maxLength={100}
                          value={plot.name}
                          onChange={(e) =>
                            setPlot({ ...plot, name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        {t("district")}
                        <select
                          value={plot.district}
                          onChange={(e) =>
                            setPlot({ ...plot, district: e.target.value })
                          }
                        >
                          {options.districts.map((d) => (
                            <option key={d.id} value={d.name}>
                              {t(d.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {t("area")}
                        <input
                          value={plot.area}
                          onChange={(e) =>
                            setPlot({
                              ...plot,
                              area: normalizeDigits(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        {t("unit")}
                        <select
                          value={plot.unit}
                          onChange={(e) =>
                            setPlot({ ...plot, unit: e.target.value })
                          }
                        >
                          {["ha", "acre", "decimal"].map((u) => (
                            <option key={u} value={u}>
                              {t(u)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button disabled={busy}>{t("addPlot")}</button>
                  </form>
                  {plots.map((p) => (
                    <p key={p.id}>
                      {p.name} · {t(p.district)} · {n(p.area)} {t(p.unit)}
                    </p>
                  ))}
                </section>
              </>
            )}
          </main>
        </div>
      )}
      <footer className="no-print">
        {t("brand")} · {t("privacy")}
      </footer>
    </>
  );
}
