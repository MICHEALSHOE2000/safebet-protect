"use client";
import Link from "next/link";
import { PlayerDashboard, ExclusionJourney } from "./workspace/player";
import { PublicShell } from "./public/shell";
import { WorkspaceExtras } from "./workspace/extras";
import { navigationFor } from "./workspace/navigation";
import { browserClient } from "../lib/supabase/browser";
import { PilotStation, PilotEnrol, PublicComplaint, DemoGuide } from "./pilot";
import ProductionPage, { AccessPage } from "./production";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Clock3,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  Globe2,
  Menu,
  X,
  LogOut,
  Users,
  Store,
  Landmark,
  Settings,
  Play,
  LockKeyhole,
  Shield,
  Plus,
  Search,
  AlertTriangle,
  Download,
  CheckCircle2,
  Activity,
  Copy,
  HelpCircle,
  Leaf,
} from "lucide-react";
import {
  states,
  statuses,
  durationLabels,
  resourceData,
} from "../lib/constants";
type Any = Record<string, any>;
const date = (v: number) =>
  v === 253402300799000
    ? "Indefinite"
    : new Date(v).toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
const shortDate = (v: number) =>
  v === 253402300799000
    ? "Indefinite"
    : new Date(v).toLocaleDateString("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
const rolePath: Any = {
  player: "/player/dashboard",
  shop: "/shop/dashboard",
  owner: "/owner/dashboard",
  regulator: "/regulator/dashboard",
  admin: "/admin/dashboard",
};
const questions = [
  "Have you spent more on gambling than you intended?",
  "Have you tried to win back money you previously lost?",
  "Have you borrowed money to gamble?",
  "Have you found it difficult to stop gambling?",
  "Has gambling affected your relationships?",
  "Has gambling created money problems?",
  "Have you felt guilt or regret about gambling?",
  "Has gambling interfered with work or education?",
  "Have you felt distressed about your gambling?",
];
const iconFor: Any = {
  player: ShieldCheck,
  shop: Store,
  owner: Users,
  regulator: Landmark,
  admin: Settings,
};
function Field({ label, children }: any) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Badge({ children, tone = "green" }: any) {
  return (
    <span className={`badge ${tone}`}>
      <span className="dot" />
      {children}
    </span>
  );
}
function Empty({ children }: any) {
  return (
    <div className="empty">
      <Shield size={30} />
      <p>{children}</p>
    </div>
  );
}
export default function Protect() {
  const router = useRouter(),
    path = usePathname() || "/";
  const [data, setData] = useState<Any>({}),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [pidgin, setPidgin] = useState(false),
    [mobile, setMobile] = useState(false),
    [now, setNow] = useState(() => Date.now()),
    [offset, setOffset] = useState(0),
    [selectedDays, setSelectedDays] = useState(90),
    [consent, setConsent] = useState(false),
    [token, setToken] = useState<Any | null>(null),
    [result, setResult] = useState<Any | null>(null),
    [answers, setAnswers] = useState<number[]>(Array(9).fill(-1)),
    [assessed, setAssessed] = useState(false),
    [activeResource, setActiveResource] = useState<number | null>(null),
    [extraResources, setExtraResources] = useState<any[]>([]),
    [step, setStep] = useState(0),
    [selectedState, setSelectedState] = useState("Lagos"),
    [filter, setFilter] = useState("All"),
    [offline, setOffline] = useState(false);
  const t = (en: string, pg: string) => (pidgin ? pg : en);
  const u = data.user,
    role = u?.role,
    ex = data.exclusion,
    active = !!ex && ex.end > now;
  async function refresh() {
    try {
      const r = await fetch("/api/protect", { cache: "no-store" });
      const d: any = await r.json();
      if (!r.ok)
        throw Error(
          `${d.error}${d.requestId ? " Reference: " + d.requestId : ""}`,
        );
      setError("");
      setData(d);
      setOffset(d.now - Date.now());
      setNow(d.now);
    } catch (e: any) {
      setError(e.message || "Unable to load your workspace.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (path === "/" && role && role !== "player")
      router.replace(rolePath[role]);
  }, [path, role, router]);
  useEffect(() => {
    if (
      (/^\/(player|shop|owner|regulator|admin)(\/|$)/.test(path) &&
        path !== "/player/self-assessment") ||
      path === "/register" ||
      path === "/workspace"
    )
      queueMicrotask(() => {
        void refresh();
      });
    else queueMicrotask(() => setLoading(false));
    fetch("/api/resources")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setExtraResources(d))
      .catch(() => {});
  }, [path]);
  useEffect(() => {
    if (path === "/workspace" && u)
      router.replace(data.home || rolePath[u.role]);
  }, [path, u, router]);
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(i);
  }, [offset]);
  useEffect(() => {
    queueMicrotask(() => {
      setError("");
      setMobile(false);
      setResult(null);
      setConsent(false);
    });
    window.scrollTo(0, 0);
  }, [path]);
  useEffect(() => {
    const lost = () => {
      setResult(null);
      setError(
        "Verification unavailable. Follow the shop’s approved safe-service procedure.",
      );
    };
    window.addEventListener("offline", lost);
    return () => window.removeEventListener("offline", lost);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const i = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(i);
  }, [toast]);
  async function api(action: string, payload: Any = {}) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const d: any = await r.json();
      if (!r.ok)
        throw Error(
          `${d.error}${d.requestId ? " Reference: " + d.requestId : ""}`,
        );
      await refresh();
      return d;
    } catch (e: any) {
      setError(e.message || "Connection unavailable. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  const go = (p: string) => router.push(p);
  const notify = (s: string) => setToast(s);
  async function enter() {
    window.location.href = "/signin";
  }
  const nav = navigationFor(role);
  const btn = (label: string, p: string, primary = false) => (
    <button className={primary ? "btn primary" : "btn"} onClick={() => go(p)}>
      {label}
      <ArrowUpRight size={17} />
    </button>
  );
  const loginRequired =
    (path.startsWith("/player") && path !== "/player/self-assessment") ||
    (path.startsWith("/shop/") && !path.endsWith("login")) ||
    path.startsWith("/owner") ||
    (path.startsWith("/regulator/") && !path.endsWith("login")) ||
    path.startsWith("/admin") ||
    path === "/register";
  const expectedRole =
    path.startsWith("/player") ||
    path === "/report-shop" ||
    path === "/register"
      ? "player"
      : path.split("/")[1];
  function reports(reg = false) {
    const cases = (data.complaints || []).filter(
      (c: any) => filter === "All" || c.status === filter,
    );
    return (
      <>
        <div className="spread section-heading">
          <div>
            <h2>{reg ? "Complaint casebook" : "Your reports"}</h2>
            <p>
              {reg
                ? "Confidential allegations in your assigned jurisdiction."
                : "Follow your case from submission to review."}
            </p>
          </div>
          {!reg && btn("New report", "/report-shop", true)}
        </div>
        <div className="notice">
          <LockKeyhole size={18} />
          Reports are confidential allegations. Platform updates do not imply
          government action.
        </div>
        <div className="filterbar">
          <label>
            Case status{" "}
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <span>{cases.length} cases</span>
        </div>
        {!cases.length && (
          <Empty>
            No cases to show. A report will appear here after submission.
          </Empty>
        )}
        {cases.map((c: any) => (
          <details className="case card" key={c.id}>
            <summary>
              <div>
                <span className="eyebrow">
                  {c.id} · {c.state}
                </span>
                <h3>{c.shopName}</h3>
                <p>{c.category}</p>
              </div>
              <div>
                <Badge tone={c.status === "Resolved" ? "green" : "amber"}>
                  {c.status}
                </Badge>
                <ChevronRight size={18} />
              </div>
            </summary>
            <div className="case-body">
              <p>{c.description}</p>
              <p className="muted">
                {c.location} · {c.incidentDate || date(c.created)} ·{" "}
                {c.confidential
                  ? "Confidentiality requested"
                  : "Standard confidential handling"}
              </p>
              <h4>Case history</h4>
              {c.updates.map((v: any, i: number) => (
                <div className="timeline" key={i}>
                  <span className="timeline-dot" />
                  <div>
                    <b>{v.status}</b>
                    <small>{date(v.at)} WAT</small>
                    <p>{v.note}</p>
                  </div>
                </div>
              ))}
              <h4>Evidence ({c.evidence.length}/5)</h4>
              {c.evidence.map((e: any) => (
                <a
                  className="evidence"
                  key={e.key}
                  href={`/api/evidence?case=${encodeURIComponent(c.id)}&key=${encodeURIComponent(e.key)}`}
                >
                  {e.name} <Download size={14} />
                </a>
              ))}
              {!reg && (
                <Field label="Add evidence · PNG, JPG or PDF · max 2 MB">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      const form = new FormData();
                      form.append("caseId", c.id);
                      form.append("file", e.target.files[0]);
                      setBusy(true);
                      try {
                        const r = await fetch("/api/evidence", {
                          method: "POST",
                          body: form,
                        });
                        const d: any = await r.json();
                        if (!r.ok)
                          throw Error(
                            `${d.error}${d.requestId ? " Reference: " + d.requestId : ""}`,
                          );
                        await refresh();
                        notify("Evidence saved to your case.");
                      } catch (e: any) {
                        setError(e.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </Field>
              )}
              {reg && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = Object.fromEntries(new FormData(e.currentTarget));
                    if (await api("updateCase", { ...f, id: c.id }))
                      notify("Case updated. The player can see your update.");
                  }}
                >
                  <div className="formgrid">
                    <Field label="Update status">
                      <select name="status" defaultValue={c.status}>
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Assigned compliance officer">
                      <select
                        name="assignedTo"
                        defaultValue={c.assignedTo || ""}
                      >
                        <option value="">Unassigned</option>
                        {data.officers?.map((o: any) => (
                          <option key={o.id} value={o.id}>
                            {o.email}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Message to player">
                      <input
                        name="note"
                        placeholder="Explain the next step"
                        required
                        maxLength={1000}
                      />
                    </Field>
                  </div>
                  <button className="btn primary" disabled={busy}>
                    Save case update <Check size={17} />
                  </button>
                </form>
              )}
            </div>
          </details>
        ))}
      </>
    );
  }
  function checkTable() {
    return (
      <div className="card tablewrap">
        <div className="spread section-heading">
          <h3>Verification activity</h3>
          <span className="muted">Recorded activity</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Time (WAT)</th>
              <th>Result</th>
              <th>Service decision</th>
            </tr>
          </thead>
          <tbody>
            {(data.checks || [])
              .slice()
              .reverse()
              .map((c: any) => (
                <tr key={c.id}>
                  <td>{date(c.at)}</td>
                  <td>
                    <Badge tone={c.active ? "red" : "neutral"}>
                      {c.result ||
                        (c.active ? "Exclusion active" : "No active exclusion")}
                    </Badge>
                  </td>
                  <td>
                    {c.refused
                      ? "Service refused"
                      : c.active
                        ? "Refusal not recorded"
                        : "Other checks still required"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!data.checks?.length && (
          <Empty>No checks yet. Complete a player verification to begin.</Empty>
        )}
      </div>
    );
  }
  function csv() {
    const lines = [
      "State,Participating outlets,Active exclusions,Checks,Refusals,Complaints",
      `${u.state},${data.shops?.length || 0},${data.stats?.active || 0},${data.checks?.length || 0},${data.checks?.filter((c: any) => c.refused).length || 0},${data.complaints?.length || 0}`,
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv" }),
    );
    a.download = "safebet-anonymised-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  let content: React.ReactNode;
  if (error && !u)
    content = (
      <div className="card formcard">
        <h1>We couldn’t open your workspace.</h1>
        <p>{error}</p>
        <button className="btn primary" onClick={refresh}>
          Retry connection
        </button>
        <Link className="btn" href="/signin">
          Sign in again
        </Link>
      </div>
    );
  else if (loading)
    content = <div className="empty">Loading your protection workspace…</div>;
  else if (path === "/workspace")
    content = u ? (
      <div className="empty">Opening your assigned workspace…</div>
    ) : (
      <AccessPage user={u} />
    );
  else if (path === "/report-shop") content = <PublicComplaint />;
  else if (path === "/demo") content = <DemoGuide />;
  else if (loginRequired && (!u || role !== expectedRole))
    content = <AccessPage user={u} />;
  else if (
    [
      "/player/account",
      "/regulator/audit",
      "/admin/health",
      "/owner/activity",
      "/regulator/investigations",
      "/shop/incident",
    ].includes(path)
  )
    content = (
      <WorkspaceExtras
        path={path}
        data={data}
        api={api}
        busy={busy}
        checks={checkTable}
      />
    );
  else if (data.demoMode && (path === "/register" || path === "/shop/enrol"))
    content = <PilotEnrol api={api} busy={busy} go={go} role={role} />;
  else if (
    data.demoMode &&
    (path === "/shop/dashboard" || path === "/shop/verify")
  )
    content = <PilotStation api={api} busy={busy} checks={checkTable} />;
  else if (
    path === "/register" ||
    path === "/shop/enrol" ||
    path === "/shop/dashboard" ||
    path === "/shop/verify" ||
    path.startsWith("/admin") ||
    path.startsWith("/owner") ||
    path === "/privacy" ||
    path === "/about" ||
    path === "/how-it-works" ||
    path === "/demo" ||
    path.endsWith("/login") ||
    path === "/login"
  )
    content = (
      <ProductionPage
        key={path}
        path={path}
        data={data}
        api={api}
        go={go}
        notify={notify}
        busy={busy}
        now={now}
        checks={checkTable}
      />
    );
  else if (path === "/player/dashboard" || path === "/player/exclusion-status")
    content = (
      <PlayerDashboard
        exclusion={ex}
        customer={data.customer}
        now={now}
        demoMode={!!data.demoMode}
      />
    );
  else if (path === "/player/self-exclusion")
    content = (
      <ExclusionJourney
        exclusion={ex}
        customer={data.customer}
        now={now}
        demoMode={!!data.demoMode}
        durations={data.durations || []}
        busy={busy}
        activate={async (days) => {
          if (
            await api(active ? "extend" : "exclude", { days, consent: true })
          ) {
            notify("Your protection has been saved.");
            go("/player/dashboard");
          }
        }}
      />
    );
  else if (path === "/player/self-assessment")
    content = (
      <div className="narrow wide">
        <div className="page-title">
          <span className="eyebrow">A MOMENT FOR YOU</span>
          <h1>How are things, really?</h1>
          <p>
            A private, non-judgmental check-in about your recent experience.
          </p>
        </div>
        <div className="notice">
          This is an educational reflection, not a validated screening
          instrument or diagnosis. Your answers are never shown to shop staff.
        </div>
        {assessed ? (
          <div className="card formcard">
            <HeartHandshake size={40} />
            <h2>Thank you for taking a moment.</h2>
            <p>
              {answers.some((a) => a > 0)
                ? "You noticed some experiences you may want support with. You can talk to someone you trust or a qualified professional, and choose self-exclusion at any time."
                : "You have completed your reflection. Support and self-exclusion remain available whenever you want them."}
            </p>
            {btn("Start or extend protection", "/player/self-exclusion", true)}
            {btn("Explore support", "/resources")}
            <button className="textbtn" onClick={() => setAssessed(false)}>
              Review my answers
            </button>
          </div>
        ) : (
          <form
            className="card formcard"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!u || (await api("assessment", { answers })))
                setAssessed(true);
            }}
          >
            {questions.map((q, i) => (
              <fieldset className="question" key={q}>
                <legend>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {q}
                </legend>
                <div>
                  {["Not at all", "Sometimes", "Often", "Very often"].map(
                    (s, j) => (
                      <label
                        key={s}
                        className={
                          answers[i] === j ? "answer chosen" : "answer"
                        }
                      >
                        <input
                          type="radio"
                          name={`q${i}`}
                          required
                          checked={answers[i] === j}
                          onChange={() =>
                            setAnswers((a) =>
                              a.map((v, k) => (k === i ? j : v)),
                            )
                          }
                        />
                        {s}
                      </label>
                    ),
                  )}
                </div>
              </fieldset>
            ))}
            <button className="btn primary" disabled={busy}>
              Complete my check-in <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    );
  else if (path === "/report-shop")
    content = (
      <div className="narrow wide">
        <div className="page-title">
          <span className="eyebrow">YOUR VOICE MATTERS</span>
          <h1>Report a protection concern.</h1>
          <p>
            Your report is saved to the selected state’s platform workspace.
          </p>
        </div>
        <div className="notice">
          This saves a platform report. No external government submission is
          connected.
        </div>
        <form
          className="card formcard"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            const d = await api("report", {
              ...f,
              confidential: f.confidential === "on",
            });
            if (d) {
              notify(`Report saved: ${d.id}`);
              go("/player/reports");
            }
          }}
        >
          <div className="formgrid">
            <Field label="State of incident">
              <select name="state" defaultValue="Lagos">
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Local government area">
              <input name="lga" placeholder="e.g. Ikeja" required />
            </Field>
            <Field label="Betting operator">
              <input name="operator" placeholder="Operator name" required />
            </Field>
            <Field label="Shop name">
              <input
                name="shopName"
                placeholder="Shop name"
                required
                maxLength={100}
              />
            </Field>
            <Field label="Shop location">
              <input
                name="location"
                placeholder="Street or landmark"
                required
                maxLength={150}
              />
            </Field>
            <Field label="Incident date and approximate time (WAT)">
              <input
                name="incidentDate"
                type="datetime-local"
                required
                max={new Date(now + 3600000).toISOString().slice(0, 16)}
              />
            </Field>
          </div>
          <Field label="What happened?">
            <select name="category">
              {[
                "Shop accepted a bet during active exclusion",
                "Attendant ignored exclusion warning",
                "Shop refused to check exclusion status",
                "Suspected identity misuse",
                "Privacy violation",
                "Other player protection concern",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Tell us a little more">
            <textarea
              name="description"
              rows={4}
              placeholder="Describe what happened…"
              required
              maxLength={3000}
            />
          </Field>
          <label className="checkbox">
            <input type="checkbox" name="confidential" defaultChecked />
            Request confidential handling of my identity.
          </label>
          <p className="muted">
            You can attach supporting evidence after submission. You can follow
            updates in My reports.
          </p>
          <button className="btn primary" disabled={busy}>
            Save report <ArrowRight size={17} />
          </button>
        </form>
      </div>
    );
  else if (path === "/player/reports") content = reports();
  else if (path === "/shop/compliance")
    content = (
      <>
        <div className="page-title">
          <h1>Every check counts.</h1>
          <p>Your outlet’s recorded compliance activity.</p>
        </div>
        {checkTable()}
        <form
          className="card formcard"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await api(
                "issue",
                Object.fromEntries(new FormData(e.currentTarget)),
              )
            )
              notify("Incident saved.");
          }}
        >
          <Field label="Report an operational incident">
            <textarea name="message" required maxLength={1000} />
          </Field>
          <button className="btn primary" disabled={busy}>
            Save incident
          </button>
        </form>
      </>
    );
  else if (path === "/shop/training")
    content = (
      <div className="narrow">
        <div className="page-title">
          <h1>Respectful, safer service.</h1>
          <p>Practical guidance for a participating shop.</p>
        </div>
        <div className="card formcard">
          <h2>Before every transaction</h2>
          <ul className="checklist">
            <li>
              <Check />
              Confirm identity and check a fresh reference.
            </li>
            <li>
              <Check />
              Refuse service when exclusion is active.
            </li>
            <li>
              <Check />
              Speak privately and without judgement.
            </li>
            <li>
              <Check />
              If verification fails, never assume clearance.
            </li>
            <li>
              <Check />
              Do not save or share private player details.
            </li>
          </ul>
          <button
            className="btn primary"
            disabled={busy}
            onClick={async () => {
              if (await api("training"))
                notify("Training acknowledgement recorded.");
            }}
          >
            {u.trained
              ? "Training completed — review again"
              : "Mark training complete"}
            <Check size={18} />
          </button>
        </div>
      </div>
    );
  else if (path === "/regulator/complaints")
    content = (
      <>
        {reports(true)}
        <section className="card formcard">
          <h2>Shop incident reports</h2>
          {data.incidents?.length ? (
            data.incidents.map((i: any) => (
              <p key={i.id}>
                {i.message} · {date(i.at)}
              </p>
            ))
          ) : (
            <p>No shop incidents reported.</p>
          )}
        </section>
      </>
    );
  else if (path === "/regulator/shops")
    content = (
      <>
        <div className="page-title">
          <h1>Participating outlets.</h1>
          <p>{u.state} · Fictional jurisdiction</p>
        </div>
        <div className="card formcard">
          {data.shops?.map((s: any) => (
            <div className="outlet" key={s.id}>
              <Store />
              <div>
                <h3>{s.name}</h3>
                <p>
                  {s.location} · {s.licence}
                </p>
              </div>
            </div>
          ))}
        </div>
        <form
          className="card formcard"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await api(
                "inspect",
                Object.fromEntries(new FormData(e.currentTarget)),
              )
            )
              notify("Inspection recorded.");
          }}
        >
          <h2>Record a inspection</h2>
          <div className="formgrid">
            <Field label="Outlet">
              <select name="shopId">
                {data.shops?.map((s: any) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Inspection note">
              <input name="note" required placeholder="Inspection findings" />
            </Field>
          </div>
          <button className="btn primary" disabled={busy}>
            Save inspection <Check size={17} />
          </button>
        </form>
        <div className="card formcard">
          <h3>Recorded inspections</h3>
          {data.inspections?.length ? (
            data.inspections.map((s: any) => (
              <p key={s.id}>
                {date(s.at)} — {s.note}
              </p>
            ))
          ) : (
            <p className="muted">No inspections yet.</p>
          )}
        </div>
      </>
    );
  else if (path === "/regulator/dashboard")
    content = (
      <>
        <div className="page-title spread">
          <div>
            <span className="eyebrow">
              {u.state.toUpperCase()} · ASSIGNED JURISDICTION
            </span>
            <h1>Player protection, in view.</h1>
            <p>
              Understand participation, review concerns and follow up on
              compliance.
            </p>
          </div>
          <button className="btn" onClick={csv}>
            <Download size={17} />
            Export anonymised CSV
          </button>
        </div>
        <div className="stat-grid">
          {[
            ["Participating outlets", data.shops?.length, Store],
            ["Active exclusions", data.stats?.active, ShieldCheck],
            ["Complaints received", data.complaints?.length, FileText],
            [
              "Recorded refusals",
              data.checks?.filter((c: any) => c.refused).length,
              ClipboardCheck,
            ],
          ].map(([h, n, Icon]: any) => (
            <div className="card stat" key={h}>
              <Icon size={21} />
              <span>{h}</span>
              <strong>{n || 0}</strong>
              <small>Platform records</small>
            </div>
          ))}
        </div>
        <div className="split">
          <div className="card formcard">
            <div className="spread">
              <h2>Case status overview</h2>
              <Badge tone="neutral">Recorded activity</Badge>
            </div>
            {statuses.map((s) => {
              const n =
                data.complaints?.filter((c: any) => c.status === s).length || 0;
              return (
                <div className="bar-row" key={s}>
                  <span>{s}</span>
                  <div>
                    <i
                      style={{
                        width: `${(100 * n) / Math.max(1, data.complaints?.length)}%`,
                      }}
                    />
                  </div>
                  <b>{n}</b>
                </div>
              );
            })}
          </div>
          <div className="card formcard">
            <span className="iconbox peach">
              <FileText />
            </span>
            <h2>Ready for a closer look.</h2>
            <p>
              {data.complaints?.filter(
                (c: any) => !["Resolved", "Closed"].includes(c.status),
              ).length || 0}{" "}
              cases are awaiting review or follow-up.
            </p>
            {btn("Open complaint casebook", "/regulator/complaints", true)}
            <p className="muted">
              Reports describe allegations. They do not establish a violation.
            </p>
          </div>
        </div>
        <div className="card formcard">
          <h3>Repeated complaint patterns</h3>
          {Object.entries(
            (data.complaints || []).reduce((a: Any, c: any) => {
              a[c.shopName] = (a[c.shopName] || 0) + 1;
              return a;
            }, {}),
          )
            .filter(([, n]: any) => n > 1)
            .map(([name, n]: any) => (
              <p key={name}>
                {name}: {n} allegations awaiting independent assessment.
              </p>
            ))}
          <p className="muted">
            Groupings use the reported shop name. Reports may refer to the same
            incident; counts are not findings.
          </p>
        </div>
        {checkTable()}
      </>
    );
  else if (path === "/resources" || path === "/player/support")
    content = (
      <>
        <div className="page-title spread">
          <div>
            <span className="eyebrow">SUPPORT, WITHOUT JUDGEMENT</span>
            <h1>You don’t have to do this alone.</h1>
            <p>
              Practical guidance for you, and the people who care about you.
            </p>
          </div>
          {btn("I need help now", "/help-now")}
        </div>
        <div className="resource-grid">
          {[...resourceData, ...extraResources].map((r, i) => (
            <button
              className="card resource"
              key={i}
              onClick={() => setActiveResource(i)}
            >
              <span
                className={`iconbox ${["mint", "peach", "lilac", "blue"][i % 4]}`}
              >
                {i % 2 ? <HeartHandshake size={23} /> : <BookOpen size={23} />}
              </span>
              <span className="eyebrow">{r.category}</span>
              <h3>{r.title}</h3>
              <p>{r.text.slice(0, 105)}…</p>
              <span className="textbtn">
                Read guidance <ArrowUpRight size={16} />
              </span>
            </button>
          ))}
        </div>
        {u?.role === "player" && (
          <form
            className="card formcard"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              if (await api(String(f.type), f))
                notify("Support request saved for platform review.");
            }}
          >
            <h2>Ask for support</h2>
            <p>
              This saves a support request for the platform administrator. No
              counsellor or emergency service is contacted.
            </p>
            <Field label="Request type">
              <select name="type">
                <option value="support">Support for myself</option>
                <option value="concern">
                  Concern for someone I care about
                </option>
              </select>
            </Field>
            <Field label="What would help?">
              <textarea name="message" required rows={3} />
            </Field>
            <p className="muted">
              A third-party concern never automatically excludes another adult.
            </p>
            <button className="btn primary" disabled={busy}>
              Save request <ArrowRight size={17} />
            </button>
          </form>
        )}
        {activeResource !== null && (
          <div
            className="modal-backdrop"
            onClick={() => setActiveResource(null)}
          >
            <section
              className="modal card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="resource-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close"
                aria-label="Close resource"
                onClick={() => setActiveResource(null)}
              >
                <X />
              </button>
              <span className="iconbox mint">
                <BookOpen />
              </span>
              <h2 id="resource-title">
                {[...resourceData, ...extraResources][activeResource]?.title}
              </h2>
              <p>
                {[...resourceData, ...extraResources][activeResource]?.text}
              </p>
              <button
                className="btn primary"
                onClick={() => {
                  setActiveResource(null);
                  go("/player/self-exclusion");
                }}
              >
                Explore self-exclusion <ArrowRight size={18} />
              </button>
            </section>
          </div>
        )}
      </>
    );
  else if (path === "/help-now")
    content = (
      <div className="narrow">
        <div className="page-title">
          <span className="eyebrow">TAKE THIS MOMENT SLOWLY</span>
          <h1>You deserve support right now.</h1>
          <p>Start with one small action.</p>
        </div>
        <div className="card formcard">
          <HeartHandshake size={42} />
          <h2>Pause. Find some space.</h2>
          <p>
            Step away from the betting shop or screen. Take a slow breath and
            feel your feet on the ground. Reach out to someone you trust and let
            them know you need company.
          </p>
          <h3>If you are in immediate danger</h3>
          <p>
            Go to the nearest emergency department or seek urgent local
            emergency help. Ask a trusted person to stay with you while you get
            help.
          </p>
          <h3>A message you can use</h3>
          <blockquote>
            “I’m having a difficult moment and I need some support. Can you stay
            with me or call me?”
          </blockquote>
          {btn("Find more support", "/resources", true)}
          <small className="muted">
            This platform cannot provide emergency assistance. No unverified
            contact numbers are listed.
          </small>
        </div>
      </div>
    );
  else if (path === "/authorities")
    content = (
      <>
        <div className="page-title">
          <span className="eyebrow">LOCAL ROUTING. CLEAR ACCOUNTABILITY.</span>
          <h1>Find your state’s reporting pathway.</h1>
          <p>
            36 states and the FCT. Official contact details are displayed only
            when verified.
          </p>
        </div>
        <div className="card formcard">
          <Field label="Choose a jurisdiction">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div className="authority">
            <Landmark size={38} />
            <div>
              <h2>{selectedState}</h2>
              <Badge tone="amber">
                Official reporting channel not yet verified
              </Badge>
              <p>
                No official authority name, website, phone number or complaint
                endpoint has been verified for this service.
              </p>
              <p className="muted">
                Last verified: not verified. Platform reporting is available; no
                external government submission is connected.
              </p>
              {btn("Save a report", "/report-shop", true)}
            </div>
          </div>
        </div>
      </>
    );
  else
    content = (
      <div className="narrow">
        <h1>That page isn’t here.</h1>
        {btn("Return to overview", "/", true)}
      </div>
    );
  const publicPage = !loginRequired && !path.startsWith("/workspace");
  if (publicPage)
    return (
      <PublicShell>
        <div className="public-content">{content}</div>
      </PublicShell>
    );
  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <button className="brand" onClick={() => go("/")}>
          <span className="brand-icon">
            <ShieldCheck size={28} />
          </span>
          <span>
            SafeBet<span>PROTECT NIGERIA</span>
          </span>
        </button>
        <div className="workspace-label">
          {role
            ? `${role === "shop" ? "SHOP ATTENDANT" : role.toUpperCase()} WORKSPACE`
            : "YOUR PROTECTION SPACE"}
        </div>
        <nav>
          {nav.map(([p, label, Icon]: any) => (
            <button
              className={
                path === p || (p === "/player/dashboard" && path === "/")
                  ? "nav-item active"
                  : "nav-item"
              }
              key={p + label}
              onClick={() => go(p)}
            >
              <Icon size={19} />
              <span>
                {t(
                  label,
                  (
                    {
                      "My overview": "My overview",
                      "My protection": "My protection",
                      "Self check-in": "Check yourself",
                      "My reports": "My reports",
                    } as Any
                  )[label] || label,
                )}
              </span>
              {(path === p || (p === "/player/dashboard" && path === "/")) && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="nav-divider" />
        <div className="workspace-label">GUIDANCE & SUPPORT</div>
        <nav>
          {[
            ["/resources", "Resource centre", BookOpen],
            ["/authorities", "State authorities", Landmark],
            ["/how-it-works", "How it works", HelpCircle],
          ].map(([p, label, Icon]: any) => (
            <button
              className={path === p ? "nav-item active" : "nav-item"}
              key={p + label}
              onClick={() => go(p)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <HeartHandshake size={24} />
            <b>There’s support for you.</b>
            <p>Even on the difficult days.</p>
            <button onClick={() => go("/help-now")}>
              Find help now <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className="nav-item demo-link"
            onClick={() => (u ? go(rolePath[role]) : enter())}
          >
            <Play size={17} /> My workspace <ArrowUpRight size={15} />
          </button>
          <div className="sidebar-footer">
            <span className="tinyshield">
              <ShieldCheck size={14} />
            </span>{" "}
            Independent service <span className="version">v2.0</span>
          </div>
        </div>
      </aside>
      {mobile && (
        <div className="sidebar-overlay" onClick={() => setMobile(false)} />
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={23} />
            </button>
            <ShieldCheck size={16} />
            <span>
              {role
                ? (
                    {
                      player: "Player portal",
                      shop: "Shop portal",
                      owner: "Owner portal",
                      regulator: "Regulator portal",
                      admin: "Admin portal",
                    } as Any
                  )[role]
                : "Player protection"}
            </span>
            <ChevronRight size={13} />
            <b>
              {path === "/"
                ? "Overview"
                : path.split("/").pop()?.replaceAll("-", " ")}
            </b>
          </div>
          <div className="header-actions">
            <span className="language">
              <Globe2 size={16} />
              English
            </span>
            <span className="header-divider" />
            {u ? (
              <>
                <button
                  className="profile"
                  onClick={() => (u ? go(rolePath[role]) : enter())}
                >
                  <span className="avatar">
                    {u.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s: string) => s[0])
                      .join("")}
                  </span>
                  <span>
                    <b>{u.name}</b>
                    <small>
                      {data.demoMode
                        ? "Fictional pilot account"
                        : "Signed-in account"}
                    </small>
                  </span>
                </button>
                <button
                  className="icon-btn"
                  aria-label="Log out"
                  onClick={async () => {
                    try {
                      const { error } = await browserClient().auth.signOut();
                      if (error) throw error;
                      window.location.assign("/");
                    } catch {
                      setError("Sign-out failed. Please try again.");
                    }
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <button
                className="btn small"
                onClick={() => (u ? go(rolePath[role]) : enter())}
              >
                Sign in <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </header>
        <div className="demo-banner">
          <span>
            <span className="demo-dot" /> PLAYER PROTECTION
          </span>
          <p>
            {data.demoMode
              ? "FICTIONAL DEMONSTRATION · Simulated identities · No government affiliation"
              : "Independent service. Participating outlets only."}
          </p>
          <button onClick={() => go(data.demoMode ? "/demo" : "/about")}>
            {data.demoMode ? "Demo guide" : "Learn more"}{" "}
            <ArrowUpRight size={13} />
          </button>
        </div>
        <main>
          {!loading &&
            !data.identityReady &&
            (path === "/register" || path === "/shop/enrol") && (
              <div className="notice">
                <AlertTriangle size={18} />
                <span>
                  Identity verification setup is pending. Customer enrolment is
                  not open yet.
                </span>
              </div>
            )}
          {error && (
            <div className="error" role="alert">
              <AlertTriangle size={19} />
              <span>{error}</span>
              <button onClick={refresh}>Retry</button>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}
          {content}
          <footer className="footer">
            <span>
              <ShieldCheck size={15} /> Your choice. Your protection. Your
              recovery.
            </span>
            <div>
              <button onClick={() => go("/privacy")}>
                Privacy & protection
              </button>
              <button onClick={() => go("/about")}>About the project</button>
            </div>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={21} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
