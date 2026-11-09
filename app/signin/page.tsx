"use client";
import { useState, type FormEvent } from 'react';
import { browserClient } from '../../lib/supabase/browser';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const client = browserClient();
      if (!sent) {
        const {error} = await client.auth.signInWithOtp({email: email.trim(), options: {shouldCreateUser: true}});
        if (error) throw Error('Unable to send a code. Please check your email address and try again later.');
        setSent(true);
      } else {
        const {error} = await client.auth.verifyOtp({email: email.trim(), token: code.trim(), type: 'email'});
        if (error) throw Error('This code is invalid or expired. Request a new code and try again.');
        window.location.assign('/');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed. Please retry.'); }
    finally {setBusy(false);}
  }
  return <main className="narrow" style={{padding: '64px 20px'}}><div className="page-title"><h1>Sign in to SafeBet Protect</h1><p>We’ll email a one-time code. New accounts start with player access.</p></div><form className="card formcard" onSubmit={submit}>
    <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} disabled={sent} onChange={e=>setEmail(e.target.value)} required/></label>
    {sent && <><p>Check your inbox for your sign-in code.</p><label className="field"><span>Email code</span><input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value)} required minLength={6} maxLength={10}/></label></>}
    {error && <p role="alert" className="error">{error}</p>}
    <button className="btn primary" disabled={busy}>{busy ? 'Please wait…' : sent ? 'Verify and sign in' : 'Email me a code'}</button>
    {sent && <button type="button" className="btn" disabled={busy} onClick={()=>{setSent(false);setCode('');setError('');}}>Change email or request a new code</button>}
    <p>Customers without email or a phone can enrol through an authorised attendant using NIN verification.</p><a href="/">Back to SafeBet Protect</a>
  </form></main>;
}
