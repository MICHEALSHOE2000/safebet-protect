"use client";
import { useState, type FormEvent } from "react";
import { browserClient } from "../../lib/supabase/browser";
import { PublicShell } from "../../components/public/shell";
export default function SignIn() {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [resendAt, setResendAt] = useState(0);
  async function send() {
    const { error } = await browserClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error)
      throw Error(
        "We could not send your email code. Check your email address or try again shortly.",
      );
    setSent(true);
    setResendAt(Date.now() + 60000);
    setNotice(
      "A new code has been requested. Check your inbox and spam folder.",
    );
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!sent) await send();
      else {
        const { data, error } = await browserClient().auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: "email",
        });
        if (error)
          throw Error(
            "This code is invalid or has expired. Check the latest email or request a new code.",
          );
        if (!data.session)
          throw Error(
            "Your session was not confirmed. Please request a new code.",
          );
        window.location.assign("/workspace");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign-in failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicShell>
      <section className="auth-page">
        <span className="public-eyebrow">YOUR NEXT STEP STARTS HERE</span>
        <h1>Welcome to SafeBet.</h1>
        <p>
          Sign in with an email code. New accounts receive player access. Staff
          open the workspace assigned to their verified email.
        </p>
        <form className="card" onSubmit={submit}>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              disabled={sent}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {sent && (
            <label className="field">
              <span>Six-digit email code</span>
              <input
                className="auth-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                minLength={6}
                maxLength={6}
                autoFocus
              />
            </label>
          )}
          {notice && <p role="status">{notice}</p>}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="btn primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : sent
                ? "Verify and sign in"
                : "Email me a code"}
          </button>
          {sent && (
            <>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={async () => {
                  if (Date.now() < resendAt) {
                    setError(
                      "Please wait one minute before requesting another code.",
                    );
                    return;
                  }
                  setBusy(true);
                  setError("");
                  try {
                    await send();
                    setCode("");
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Email delivery failed.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Resend code
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={() => {
                  setSent(false);
                  setCode("");
                  setNotice("");
                  setError("");
                }}
              >
                Use a different email
              </button>
            </>
          )}
          <p style={{ marginTop: 24 }}>
            Demonstration enrolment uses fictional identities only. Real
            customer enrolment is not open until identity verification is
            approved and tested.
          </p>
        </form>
      </section>
    </PublicShell>
  );
}
