"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function WorkspaceExtras({ path, data, api, busy, checks }: any) {
  const [health, setHealth] = useState<any>(null);
  useEffect(() => {
    if (path === "/admin/health")
      fetch("/api/health")
        .then(async (r) => {
          const d = await r.json();
          setHealth(d);
        })
        .catch(() =>
          setHealth({
            error: "Diagnostics could not be loaded. Retry this page.",
          }),
        );
  }, [path]);
  if (path === "/admin/health")
    return (
      <section className="card formcard">
        <h1>System health</h1>
        <p>
          Only readiness checks are returned. No secret values are displayed.
        </p>
        {health?.error ? (
          <p role="alert">{health.error}</p>
        ) : health ? (
          <dl>
            {Object.entries(health.checks).map(([k, v]) => (
              <div className="outlet" key={k}>
                <dt>{k}</dt>
                <dd>{v ? "Ready" : "Needs attention"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p>Checking configuration…</p>
        )}
        <p>
          For connection, TLS and migration troubleshooting, use
          docs/DEPLOYMENT-CHECKLIST.md with the request reference.
        </p>
      </section>
    );
  if (path === "/player/account")
    return (
      <section className="card formcard">
        <h1>My account</h1>
        <p>{data.user.email}</p>
        <p>
          Your account has player access. Staff permissions can only be assigned
          by an authorised administrator.
        </p>
        <h2>My protection history</h2>
        {data.history?.length ? (
          data.history.map((e: any) => (
            <p key={e.id}>
              {new Date(e.at).toLocaleString("en-NG", {
                timeZone: "Africa/Lagos",
              })}{" "}
              WAT · {e.active ? "Exclusion active" : "Check recorded"} ·{" "}
              {e.refused ? "Service refused" : "No refusal recorded"}
            </p>
          ))
        ) : (
          <p>No shop checks recorded for your protection record.</p>
        )}
      </section>
    );
  if (path === "/regulator/audit")
    return (
      <section className="card tablewrap">
        <h1>Jurisdiction audit history</h1>
        <p>Events linked to records in your assigned jurisdiction.</p>
        <table>
          <thead>
            <tr>
              <th>Time (WAT)</th>
              <th>Action</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {data.audit?.map((e: any) => (
              <tr key={e.id}>
                <td>
                  {new Date(e.at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })}
                </td>
                <td>{e.action}</td>
                <td>{e.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.audit?.length && <p>No recorded events yet.</p>}
      </section>
    );
  if (path === "/shop/incident")
    return (
      <form
        className="card formcard"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (await api("issue", Object.fromEntries(new FormData(form))))
            form.reset();
        }}
      >
        <h1>Report an incident</h1>
        <label className="field">
          Describe the operational concern
          <textarea name="message" required maxLength={1000} />
        </label>
        <p>
          Do not include identity documents or private counselling information.
        </p>
        <button className="btn primary" disabled={busy}>
          Save incident
        </button>
      </form>
    );
  if (path === "/regulator/investigations")
    return (
      <section className="card formcard">
        <h1>Compliance investigations</h1>
        <p>
          Reports are allegations until investigated. Assign a case, record an
          action and update its status in the casebook.
        </p>
        <Link className="btn primary" href="/regulator/complaints">
          Open reported violations
        </Link>
        <Link className="btn" href="/regulator/shops">
          Record an outlet inspection
        </Link>
      </section>
    );
  return (
    <>
      <h1>Verification activity</h1>
      {checks()}
    </>
  );
}
