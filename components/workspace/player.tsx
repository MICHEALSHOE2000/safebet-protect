"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Clock3,
  HeartHandshake,
  FileText,
} from "lucide-react";
import { durationLabels } from "../../lib/constants";
type Exclusion = { start: number; end: number };
type Customer = { credential?: string; masked?: string };
const indefinite = 253402300799000;
const date = (n: number) =>
  n === indefinite
    ? "Indefinite"
    : new Date(n).toLocaleDateString("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
export function PlayerDashboard({
  exclusion,
  customer,
  now,
  demoMode,
}: {
  exclusion?: Exclusion;
  customer?: Customer;
  now: number;
  demoMode: boolean;
}) {
  const active = !!exclusion && exclusion.end > now;
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">MY PROTECTION</span>
        <h1>Your choice. Supported.</h1>
        <p>Understand your protection, review your dates and find support.</p>
      </div>
      <div className="split">
        <section className="protection-card">
          <ShieldCheck size={32} />
          <h2>
            {active
              ? "YOUR SELF-EXCLUSION IS ACTIVE"
              : exclusion
                ? "Your exclusion period has ended"
                : customer
                  ? "Ready to choose your protection"
                  : "Start with a protection profile"}
          </h2>
          {exclusion && (
            <>
              <p>
                Started: {date(exclusion.start)}
                <br />
                Protection until: {date(exclusion.end)}
              </p>
              <div className="remaining">
                <strong>
                  {exclusion.end === indefinite
                    ? "∞"
                    : Math.max(0, Math.ceil((exclusion.end - now) / 86400000))}
                </strong>
                <span>days remaining</span>
              </div>
            </>
          )}
          <Link
            className="btn light"
            href={customer ? "/player/self-exclusion" : "/register"}
          >
            {active
              ? "Extend my protection"
              : customer
                ? "Start self-exclusion"
                : demoMode
                  ? "Create fictional profile"
                  : "View enrolment requirements"}
            <ArrowRight size={18} />
          </Link>
          <p>
            Fixed periods cannot be cancelled or shortened early. Expiry is not
            a recommendation to gamble.
          </p>
        </section>
        <section className="card formcard">
          <span className="eyebrow">AT A PARTICIPATING SHOP</span>
          <h2>
            {demoMode
              ? "Your fictional player reference"
              : "Your protection record"}
          </h2>
          {customer ? (
            <p className="player-reference">
              {customer.credential || customer.masked}
            </p>
          ) : (
            <p>No enrolled profile yet.</p>
          )}
          <p>
            {demoMode
              ? "Use this DEMO reference at either fictional shop. It is not real identity verification."
              : "A participating shop must complete the approved identity and protection checks."}
          </p>
          <div className="notice">
            Coverage is limited to participating outlets. This prototype is not
            a live nationwide service.
          </div>
          <Link className="textbtn" href="/player/account">
            View my protection history <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="quick-grid">
        {[
          {
            icon: Clock3,
            title: "Review my period",
            href: "/player/self-exclusion",
            text: "Understand the dates before extending protection.",
          },
          {
            icon: FileText,
            title: "Report a violation",
            href: "/report-shop",
            text: "Raise a concern through the independent pilot.",
          },
          {
            icon: HeartHandshake,
            title: "Find recovery support",
            href: "/resources",
            text: "Practical steps and support, without judgement.",
          },
        ].map(({ icon: Icon, title, href, text }) => (
          <Link key={href} href={href} className="card quick">
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
export function ExclusionJourney({
  exclusion,
  customer,
  now,
  demoMode,
  durations,
  busy,
  activate,
}: {
  exclusion?: Exclusion;
  customer?: Customer;
  now: number;
  demoMode: boolean;
  durations: number[];
  busy: boolean;
  activate: (days: number) => Promise<void>;
}) {
  const [step, setStep] = useState(0),
    [days, setDays] = useState(
      durations.includes(180) ? 180 : (durations[0] ?? 90),
    ),
    [consent, setConsent] = useState(false);
  const active = !!exclusion && exclusion.end > now;
  if (!customer)
    return (
      <section className="card formcard narrow">
        <h1>
          {demoMode
            ? "Create a fictional profile first"
            : "Verified enrolment comes first"}
        </h1>
        <p>
          {demoMode
            ? "No real NIN, phone number or identity document is needed for the demonstration."
            : "Real enrolment remains closed until the approved identity service has been configured and tested."}
        </p>
        <Link href="/register" className="btn primary">
          View enrolment <ArrowRight size={18} />
        </Link>
      </section>
    );
  if (active && exclusion?.end === indefinite)
    return (
      <section className="card formcard">
        <h1>Your indefinite exclusion is active.</h1>
        <p>It has no scheduled expiry and cannot be shortened here.</p>
        <Link href="/player/dashboard" className="btn primary">
          Return to My Protection
        </Link>
      </section>
    );
  const start = active ? exclusion!.start : now,
    end =
      days === 0
        ? indefinite
        : (active ? exclusion!.end : now) + days * 86400000;
  return (
    <div className="narrow wide">
      <div className="page-title">
        <span className="eyebrow">STEP {step + 1} OF 3</span>
        <h1>
          {active
            ? "Give yourself more time."
            : "Choose a period of protection."}
        </h1>
        <p>Understand the commitment before you activate it.</p>
      </div>
      <ol className="journey-steps" aria-label="Self-exclusion steps">
        {["Understand", "Choose duration", "Confirm consent"].map(
          (label, i) => (
            <li key={label} aria-current={step === i ? "step" : undefined}>
              {i + 1}. {label}
            </li>
          ),
        )}
      </ol>
      <section className="card formcard">
        {step === 0 ? (
          <>
            <h2>A voluntary decision, respected at the counter.</h2>
            <p>
              You are asking participating betting shops to refuse gambling
              services during your chosen period. An active fixed-term exclusion
              cannot be cancelled just because you change your mind.
            </p>
            <p>
              Only participating shops are covered. Online gambling and other
              shops are outside this pilot. Use exclusion alongside practical
              support for recovery.
            </p>
            {demoMode && (
              <div className="notice">
                This is a fictional demonstration. No real person is being
                verified or excluded.
              </div>
            )}
            <button className="btn primary" onClick={() => setStep(1)}>
              Choose my duration <ArrowRight size={18} />
            </button>
          </>
        ) : step === 1 ? (
          <>
            <h2>
              {active
                ? "How much time would you like to add?"
                : "How long would you like protection?"}
            </h2>
            <div className="duration-grid">
              {durations.map((d) => (
                <button
                  type="button"
                  aria-pressed={days === d}
                  className={days === d ? "duration selected" : "duration"}
                  key={d}
                  onClick={() => setDays(d)}
                >
                  <Clock3 size={20} />
                  <b>{durationLabels[d]}</b>
                </button>
              ))}
            </div>
            <div className="date-preview">
              <span>Start date</span>
              <b>{date(start)}</b>
              <span>{active ? "New end date" : "End date"}</span>
              <b>{date(end)}</b>
            </div>
            <p>
              Months in this prototype use fixed day counts shown above. Dates
              use West Africa Time.
            </p>
            <button className="btn" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn primary" onClick={() => setStep(2)}>
              Review and confirm
            </button>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (consent) await activate(days);
            }}
          >
            <h2>Review your commitment</h2>
            <div className="date-preview">
              <span>{active ? "Additional period" : "Selected duration"}</span>
              <b>{durationLabels[days]}</b>
              <span>Start date</span>
              <b>{date(start)}</b>
              <span>Protected until</span>
              <b>{date(end)}</b>
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              I voluntarily choose this period. I understand that I cannot
              cancel or shorten an active exclusion early and that coverage
              depends on participating shops following the procedure.
            </label>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              Change duration
            </button>
            <button className="btn primary" disabled={busy || !consent}>
              {busy
                ? "Saving protection…"
                : active
                  ? "Confirm extension"
                  : "Activate my protection"}
              <ShieldCheck size={18} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
