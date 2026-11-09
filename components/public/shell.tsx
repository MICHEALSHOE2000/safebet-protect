import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="public-header">
        <Link
          className="public-brand"
          href="/"
          aria-label="SafeBet Protect home"
        >
          <ShieldCheck size={32} />
          <span>
            SafeBet<span>PROTECT NIGERIA</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/#physical-protection">Physical Shop Protection</Link>
          <Link href="/#for-shops">For Betting Shops</Link>
          <Link href="/resources">Support</Link>
        </nav>
        <div className="public-actions">
          <Link href="/signin">Sign In</Link>
          <Link className="btn primary" href="/player/self-exclusion">
            Get Protected <ArrowUpRight size={17} />
          </Link>
        </div>
        <details className="public-mobile-nav">
          <summary>Menu</summary>
          <nav>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/player/self-assessment">Self-Assessment</Link>
            <Link href="/report-shop">Report a Betting Shop</Link>
            <Link href="/resources">Recovery Resources</Link>
            <Link href="/demo">Pilot Demonstration</Link>
            <Link href="/signin">Sign In</Link>
          </nav>
        </details>
      </header>
      <main id="main-content" className="public-main">
        {children}
      </main>
      <footer className="public-footer">
        <div>
          <Link className="public-brand" href="/">
            <ShieldCheck />
            <span>
              SafeBet<span>PROTECT NIGERIA</span>
            </span>
          </Link>
          <p>Your choice deserves support beyond the screen.</p>
          <small>
            Independent pilot prototype. No government or operator affiliation
            is claimed.
          </small>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/player/self-assessment">Self-Assessment</Link>
          <Link href="/report-shop">Report a Betting Shop</Link>
          <Link href="/resources">Recovery Resources</Link>
          <Link href="/demo">Pilot Demonstration</Link>
          <Link href="/privacy">Privacy & Protection</Link>
          <Link href="/about">About SafeBet</Link>
        </nav>
      </footer>
    </div>
  );
}
