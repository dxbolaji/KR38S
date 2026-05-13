import { createFileRoute, Link } from "@tanstack/react-router";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { Typewriter, useReveal } from "@/components/trace-helpers";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "TRACE — Transparent AI-Powered Fundraising" },
      {
        name: "description",
        content:
          "TRACE is a transparent, AI-powered fundraising and financial intelligence platform. Every naira. Publicly accountable. Cryptographically enforced.",
      },
      { property: "og:title", content: "TRACE — Transparent AI-Powered Fundraising" },
      {
        property: "og:description",
        content: "Every naira. Publicly accountable. Cryptographically enforced.",
      },
    ],
    links: [{ rel: "icon", href: "/assets/img/favicon.ico" }],
  }),
});

const LOGO = "/assets/img/logo-full.png";

function BtnPrimary({ children, to = "/signup" }: { children: React.ReactNode; to?: "/signup" | "/login" }) {
  return (
    <Link
      to={to}
      className="inline-block bg-white text-[#0A0A0A] px-6 py-3 text-sm tracking-wider uppercase hover:bg-[#e5e5e5] transition-colors"
      style={{ borderRadius: 12 }}
    >
      {children}
    </Link>
  );
}

function BtnGlass({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="glass text-white px-6 py-3 text-sm tracking-wider uppercase hover:bg-white/10 transition-colors"
      style={{ borderRadius: 12 }}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`glass-card reveal p-7 ${className}`} data-delay={delay} style={{ borderRadius: 16 }}>
      {children}
    </div>
  );
}

function Index() {
  useReveal();

  return (
    <>
      <ParticleNetwork />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* NAVBAR */}
        <nav
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid #222222", background: "transparent" }}
        >
          <img src={LOGO} alt="TRACE" style={{ height: 28 }} />
          <div className="hidden md:flex items-center gap-10">
            <a href="#how" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">How It Works</a>
            <a href="#features" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">Features</a>
            <a href="#verify" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">Verify</a>
          </div>
          <BtnPrimary>Get Started</BtnPrimary>
        </nav>

        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <img src={LOGO} alt="TRACE" style={{ width: 180 }} className="mb-8" />
          <p className="text-[#888] text-[18px] mb-10 min-h-[28px] tracking-wide">
            <Typewriter text="Every naira. Publicly accountable. Cryptographically enforced." speed={40} />
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <BtnPrimary>Create a Campaign</BtnPrimary>
            <BtnGlass>See How It Works</BtnGlass>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="px-6 py-32 max-w-6xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl mb-16 tracking-tight">The problem with group money</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Blind Trust", b: "You donate and hope. There's no way to verify where the money actually went." },
              { t: "Silent Fraud", b: "Mismanagement and theft go undetected because no system flags it." },
              { t: "Zero Visibility", b: "Data exists. But understanding and verification do not." },
            ].map((c, i) => (
              <Card key={c.t} delay={i * 100}>
                <h3 className="text-white text-lg mb-3 tracking-wide">{c.t}</h3>
                <p className="text-[#888] text-sm leading-relaxed">{c.b}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="px-6 py-32 max-w-6xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl mb-16 tracking-tight">How TRACE works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Campaign Created", b: "Organization launches a public fundraising campaign on TRACE." },
              { n: "02", t: "Contributions Logged", b: "Every donation is recorded and cryptographically signed the moment it arrives." },
              { n: "03", t: "AI Scores Every Transaction", b: "The anomaly detection engine scores behavior from 0–100 and flags risk." },
              { n: "04", t: "Public Ledger, Always On", b: "Anyone can verify the fund's activity, AI explanations, and trust scores in real time." },
            ].map((s, i) => (
              <Card key={s.n} delay={i * 100}>
                <div className="text-[#888] text-xs tracking-[0.3em] mb-5">{s.n}</div>
                <h3 className="text-white text-base mb-3 tracking-wide">{s.t}</h3>
                <p className="text-[#888] text-sm leading-relaxed">{s.b}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* LIVE TRUST FEED */}
        <section id="verify" className="px-6 py-32 max-w-5xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl mb-4 tracking-tight">What transparency looks like</h2>
          <p className="reveal text-[#888] mb-12 text-base">This is what the public ledger looks like for every campaign on TRACE.</p>
          <div className="glass-card reveal" style={{ borderRadius: 16 }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #222222" }}>
              <span className="text-xs tracking-[0.3em] text-[#888] uppercase">Public Ledger — Live</span>
              <span className="text-xs text-[#22C55E] tracking-wider">● ACTIVE</span>
            </div>
            {[
              { l: "Contribution from @zainab_m", a: "₦25,000", s: 94, v: "Clean", c: "#22C55E" },
              { l: "Withdrawal — Vendor Payment", a: "₦80,000", s: 23, v: "Suspicious", c: "#EF4444" },
              { l: "Contribution from @tunde_k", a: "₦10,000", s: 88, v: "Clean", c: "#22C55E" },
              { l: "Withdrawal — Logistics", a: "₦45,000", s: 61, v: "Watch", c: "#F59E0B" },
            ].map((r, i, arr) => (
              <div
                key={i}
                className="grid grid-cols-3 items-center px-6 py-5"
                style={{ borderBottom: i === arr.length - 1 ? "none" : "1px solid #222222" }}
              >
                <span className="text-white text-sm">{r.l}</span>
                <span className="text-white text-sm text-center tracking-wider">{r.a}</span>
                <div className="flex justify-end">
                  <span
                    className="px-3 py-1 text-xs tracking-wider uppercase"
                    style={{
                      color: r.c,
                      background: `${r.c}1A`,
                      border: `1px solid ${r.c}33`,
                      borderRadius: 999,
                    }}
                  >
                    {r.v} — {r.s}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="px-6 py-32 max-w-6xl mx-auto">
          <h2 className="reveal text-4xl md:text-5xl mb-16 tracking-tight">Everything in one system</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: "Transparent Fundraising", b: "Accept contributions publicly through TRACE." },
              { t: "Public Ledger", b: "Real-time feed of every transaction, visible to anyone." },
              { t: "Anomaly Detection", b: "AI scores every transaction for suspicious behavior." },
              { t: "AI Explanations", b: "Plain-language breakdowns of every flag and insight." },
              { t: "Cryptographic Verification", b: "Every record is signed and tamper-evident." },
              { t: "Shareable Trust Pages", b: "Contributors can independently monitor any campaign." },
            ].map((f, i) => (
              <Card key={f.t} delay={(i % 3) * 100}>
                <h3 className="text-white mb-3 tracking-wide" style={{ fontSize: 15 }}>{f.t}</h3>
                <p className="text-[#888] leading-relaxed" style={{ fontSize: 13 }}>{f.b}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-40 text-center max-w-3xl mx-auto">
          <h2 className="reveal text-5xl md:text-6xl mb-6 tracking-tight">Start building trust.</h2>
          <p className="reveal text-[#888] mb-10 text-base">Launch your campaign. Let your contributors verify everything.</p>
          <div className="reveal inline-block">
            <BtnPrimary>Create a Campaign</BtnPrimary>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-8 py-8" style={{ borderTop: "1px solid #222222" }}>
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
            <img src={LOGO} alt="TRACE" style={{ height: 22 }} />
            <div className="flex items-center gap-8">
              <a href="#" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">About</a>
              <a href="#" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">Verify a Transaction</a>
              <a href="#" className="text-[#888] hover:text-white text-xs uppercase tracking-[0.2em] transition-colors">Contact</a>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-6 text-[#888] text-xs">
            © 2025 TRACE. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
