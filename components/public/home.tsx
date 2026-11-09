import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Store,
  LockKeyhole,
  Check,
  Landmark,
  HeartHandshake,
  ArrowDown,
  UserRound,
} from "lucide-react";
import { PublicShell } from "./shell";
function RegistryIllustration() {
  return (
    <figure
      className="registry-visual"
      aria-label="Illustrative fictional scenario: Player A activates self-exclusion, two shop terminals receive the same refusal decision and a regulator reviews the events."
    >
      <div className="visual-caption">
        <span className="live-dot" /> THE CONNECTED PILOT{" "}
        <span>Illustration · fictional records</span>
      </div>
      <div className="player-ticket">
        <span className="portrait-icon">
          <UserRound size={27} />
        </span>
        <div>
          <small>PLAYER A · DEMO-A</small>
          <h3>I choose 180 days.</h3>
          <p>
            <Check size={14} /> Self-exclusion activated
          </p>
        </div>
        <ShieldCheck size={30} />
      </div>
      <div className="registry-line">
        <ArrowDown size={20} />
      </div>
      <div className="registry-core">
        <ShieldCheck size={26} />
        <div>
          <strong>One shared protection registry</strong>
          <span>The same decision at every participating shop</span>
        </div>
        <LockKeyhole size={18} />
      </div>
      <div className="terminal-branches" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="terminal-grid">
        {["01", "02"].map((n) => (
          <div className="terminal" key={n}>
            <div className="terminal-chrome">
              <Store size={15} />
              <span>Fictional shop {n}</span>
              <i />
            </div>
            <div className="terminal-body">
              <span className="stop-symbol">!</span>
              <strong>
                SELF-EXCLUSION
                <br />
                ACTIVE
              </strong>
              <p>DO NOT ACCEPT A BET</p>
              <small>
                Refusal recorded <Check size={12} />
              </small>
            </div>
            <div className="terminal-foot" />
          </div>
        ))}
      </div>
      <div className="regulator-ticket">
        <Landmark size={21} />
        <div>
          <strong>Assigned pilot regulator</strong>
          <p>Reviews both shops’ compliance events</p>
        </div>
        <span>2 events</span>
      </div>
      <figcaption>
        How the system is designed to connect. This illustration is not a live
        registry result.
      </figcaption>
    </figure>
  );
}
export default function Home() {
  return (
    <PublicShell>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="public-eyebrow">
            PHYSICAL BETTING SHOP SELF-EXCLUSION
          </span>
          <h1>
            You Can Choose to Stop Gambling.
            <br />
            <em>We’ll Help You Stay Stopped.</em>
          </h1>
          <p>
            Take control beyond your phone. SafeBet is building a way to help
            people voluntarily exclude themselves from participating physical
            betting shops across Nigeria.
          </p>
          <div className="hero-buttons">
            <Link className="btn primary" href="/how-it-works">
              Explore Self-Exclusion <ArrowRight size={19} />
            </Link>
            <Link className="plain-link" href="#how-it-works">
              See How It Works <ArrowDown size={17} />
            </Link>
          </div>
          <div className="pilot-disclosure">
            <span />
            Independent pilot prototype. Not yet a live nationwide
            self-exclusion service.
          </div>
        </div>
        <RegistryIllustration />
      </section>
      <div className="principles-strip">
        <span>
          <ShieldCheck />
          Your voluntary choice
        </span>
        <span>
          <Store />
          Participating physical shops
        </span>
        <span>
          <LockKeyhole />
          Limited access to private information
        </span>
      </div>
      <section id="how-it-works" className="landing-section">
        <div className="section-intro">
          <span className="public-eyebrow">
            A SIMPLE CHOICE. A SHARED COMMITMENT.
          </span>
          <h2>
            Protection that follows you
            <br />
            to the counter.
          </h2>
          <p>
            A decision to stop should still matter when you leave your phone at
            home.
          </p>
        </div>
        <div className="steps-grid">
          {[
            [
              "01",
              "Choose your protection",
              "Understand the coverage, choose a duration and confirm your voluntary decision.",
            ],
            [
              "02",
              "Make it a shared record",
              "Your active exclusion is stored centrally for authorised participating shops to check.",
            ],
            [
              "03",
              "Keep the commitment",
              "An attendant checks your identity and protection status. Active exclusion means refusing the bet.",
            ],
          ].map(([n, h, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="physical-section" id="physical-protection">
        <div>
          <span className="public-eyebrow">BEYOND AN ONLINE ACCOUNT</span>
          <h2>
            Cash at the counter.
            <br />
            Protection at the counter.
          </h2>
          <p>
            You may not have an online betting account. You may not own a
            smartphone. You may walk into a different shop tomorrow. The
            proposed protection is tied to your verified identity across
            participating outlets.
          </p>
          <Link className="btn light" href="/demo">
            Explore the fictional pilot <ArrowRight size={18} />
          </Link>
        </div>
        <div className="protection-notes">
          <article>
            <span>01</span>
            <div>
              <h3>No smartphone? Assistance matters.</h3>
              <p>
                An authorised attendant can help explain and record voluntary
                self-exclusion. Real enrolment remains closed until identity
                verification is ready.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>A different shop. The same choice.</h3>
              <p>
                Connected shops consult the same registry. This does not cover
                every outlet or online gambling.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Private information stays private.</h3>
              <p>
                Attendants receive a service decision, not your assessments,
                complaints or recovery conversations.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="landing-section role-explain" id="for-shops">
        <div className="section-intro">
          <span className="public-eyebrow">
            DIFFERENT ROLES. ONE CONNECTED SYSTEM.
          </span>
          <h2>Everyone knows their next step.</h2>
        </div>
        <div className="role-explain-grid">
          <article>
            <ShieldCheck />
            <h3>For players</h3>
            <p>
              Choose 3 months, 6 months, a year, 5 years or indefinite
              protection when available. Review your dates before confirming.
              Fixed periods cannot be cancelled early.
            </p>
            <Link href="/player/self-exclusion">
              Explore my protection <ArrowRight size={16} />
            </Link>
          </article>
          <article>
            <Store />
            <h3>For betting shops</h3>
            <p>
              Use a clear verification station. Active exclusion means refuse
              service. Unknown identity or a connection failure means stop and
              verify.
            </p>
            <Link href="/demo">
              See the shop workflow <ArrowRight size={16} />
            </Link>
          </article>
          <article>
            <Landmark />
            <h3>For pilot regulators</h3>
            <p>
              Review assigned outlets, allegations and recorded actions within
              your jurisdiction. Reports stay in this independent pilot.
            </p>
            <Link href="/demo">
              Explore oversight <ArrowRight size={16} />
            </Link>
          </article>
        </div>
      </section>
      <section className="report-support">
        <article>
          <span className="public-eyebrow">SOMETHING WASN’T RIGHT?</span>
          <h2>
            Your concern deserves
            <br />
            to be heard.
          </h2>
          <p>
            Report a suspected protection failure and keep a private tracking
            reference. Allegations need investigation; submission does not
            notify a government agency.
          </p>
          <Link className="btn" href="/report-shop">
            Report a Betting Shop <ArrowRight size={17} />
          </Link>
        </article>
        <article>
          <HeartHandshake size={34} />
          <h2>
            You don’t have to
            <br />
            do this alone.
          </h2>
          <p>
            Self-exclusion is one part of recovery. Find practical steps, peer
            support information and guidance on seeking professional help.
          </p>
          <Link className="btn primary" href="/resources">
            Find support <ArrowRight size={17} />
          </Link>
          <Link className="plain-link" href="/player/self-assessment">
            Take a private self-assessment
          </Link>
        </article>
      </section>
      <section className="landing-section faq-section">
        <div>
          <span className="public-eyebrow">CLEAR ANSWERS</span>
          <h2>Before you decide.</h2>
          <p>Understand what the pilot can—and cannot—do.</p>
        </div>
        <div>
          {[
            [
              "Is this already protecting people nationwide?",
              "No. This is an independent pilot prototype using fictional identities and outlets. Real-world coverage requires participating operators, verified identities and agreed operating procedures.",
            ],
            [
              "Can I cancel my exclusion when I feel like betting?",
              "An activated fixed-term exclusion cannot be cancelled or shortened early. The pilot allows extensions. Indefinite protection has no scheduled expiry or self-service cancellation.",
            ],
            [
              "Do I need a phone to use physical-shop protection?",
              "The proposed assisted workflow lets an authorised attendant help a person without a smartphone. Real identity enrolment is disabled until a trusted provider has been configured and tested.",
            ],
            [
              "What can a shop attendant see?",
              "A limited verification result and service instructions. Your private assessment, complaints and support requests are not part of the attendant workspace.",
            ],
            [
              "What happens if the internet is unavailable?",
              "The shop must not treat a failed check as clearance. It should pause the transaction until identity and protection can be verified.",
            ],
            [
              "Is SafeBet an official government service?",
              "No. SafeBet Protect is independent. The demonstration does not claim approval or integration with any government agency, SafePlay or betting operator.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="closing-cta">
        <ShieldCheck size={35} />
        <h2>
          Your decision to stop
          <br />
          deserves a system of support.
        </h2>
        <Link className="btn light" href="/how-it-works">
          Understand self-exclusion <ArrowRight size={18} />
        </Link>
      </section>
    </PublicShell>
  );
}
