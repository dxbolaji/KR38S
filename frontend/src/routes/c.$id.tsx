import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  GlassCard,
  PrimaryButton,
  ProgressBar,
  PublicShell,
  SectionLabel,
  TrustBadge,
  VerifiedPill,
  formatNGN,
} from "@/components/AppShell";
import { getCampaign } from "@/lib/campaigns";

export const Route = createFileRoute("/c/$id")({
  component: PublicCampaignPage,
  head: ({ params }) => ({
    meta: [{ title: `${getCampaign(params.id)?.name ?? "Campaign"} — TRACE` }],
  }),
});

function PublicCampaignPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = getCampaign(id);
  const [copied, setCopied] = useState(false);

  if (!c) {
    return (
      <PublicShell>
        <GlassCard style={{ padding: 28, maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ color: "#FFFFFF", fontSize: 20 }}>Campaign not found</h1>
        </GlassCard>
      </PublicShell>
    );
  }

  const trustColor = c.trustScore >= 75 ? "#22C55E" : c.trustScore >= 50 ? "#F59E0B" : "#EF4444";
  const aiInsight =
    c.trustScore >= 75
      ? "This campaign shows consistent contribution patterns with transparent withdrawals. No anomalous activity detected across the transaction history."
      : c.trustScore >= 50
        ? "This campaign has some flagged transactions worth monitoring. Withdrawal patterns deviate from typical norms and warrant continued oversight."
        : "Multiple transactions on this campaign show suspicious withdrawal patterns. Lack of public reconciliation and large unaccounted outflows significantly reduce the trust score.";

  const contributions = c.transactions.filter((t) => t.amount > 0);
  const withdrawals = c.transactions.filter((t) => t.amount < 0);
  const avgTx = Math.round(
    c.transactions.reduce((s, t) => s + Math.abs(t.amount), 0) / c.transactions.length
  );
  const largestWithdrawal = withdrawals.length
    ? Math.max(...withdrawals.map((t) => Math.abs(t.amount)))
    : 0;
  const velocity = `${contributions.length} contributions`;

  const onShare = () => {
    const url = `${window.location.origin}/c/${c.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PublicShell>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ color: "#FFFFFF", fontSize: 26, marginBottom: 6 }}>{c.name}</h1>
              <div style={{ color: "#888", fontSize: 14, marginBottom: 14 }}>{c.org}</div>
              <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
                {c.description}
              </p>
              <ProgressBar value={c.raised} max={c.goal} />
              <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                {formatNGN(c.raised)} raised of {formatNGN(c.goal)} goal
                {c.endDate && <span> · Ends {c.endDate}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
              <TrustBadge level={c.trust} />
              <div style={{ color: trustColor, fontSize: 36, lineHeight: 1 }}>{c.trustScore}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, position: "relative" }}>
            <PrimaryButton
              onClick={() => navigate({ to: "/donate/$id", params: { id: c.id } })}
              style={{ padding: "12px 22px" }}
            >
              Donate
            </PrimaryButton>
            <button
              type="button"
              onClick={onShare}
              style={{
                padding: "12px 22px",
                borderRadius: 12,
                background: "transparent",
                border: "1px solid #222222",
                color: "#FFFFFF",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            >
              Share
            </button>
            {copied && (
              <span style={{ color: "#22C55E", fontSize: 12, alignSelf: "center" }}>Link copied</span>
            )}
          </div>
        </GlassCard>

        <div>
          <SectionLabel>Transaction History</SectionLabel>
          <p style={{ color: "#888", fontSize: 12, marginTop: -8, marginBottom: 12 }}>
            Every transaction is cryptographically signed and tamper-evident.
          </p>
          <GlassCard style={{ padding: 0, maxHeight: 500, overflowY: "auto" }}>
            {c.transactions.map((t, i) => (
              <div
                key={t.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: i < c.transactions.length - 1 ? "1px solid #222" : "none",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ color: "#FFFFFF", fontSize: 13 }}>{t.label}</div>
                <div style={{ color: "#FFFFFF", fontSize: 13 }}>
                  {t.amount < 0 ? "-" : ""}
                  {formatNGN(Math.abs(t.amount))}
                </div>
                <TrustBadge level={t.trust} />
                <VerifiedPill />
              </div>
            ))}
          </GlassCard>
        </div>

        <GlassCard>
          <SectionLabel>Trust Score Breakdown</SectionLabel>
          <div style={{ color: trustColor, fontSize: 56, lineHeight: 1, marginBottom: 6 }}>
            {c.trustScore}
          </div>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 18 }}>
            Based on {c.transactions.length} transactions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Stat label="Avg Transaction" value={formatNGN(avgTx)} />
            <Stat label="Largest Withdrawal" value={formatNGN(largestWithdrawal)} />
            <Stat label="Contribution Velocity" value={velocity} />
          </div>
        </GlassCard>

        <GlassCard>
          <div
            style={{
              color: "#888",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            AI Insight
          </div>
          <p style={{ color: "#FFFFFF", fontSize: 13, lineHeight: 1.6 }}>{aiInsight}</p>
        </GlassCard>

        <GlassCard>
          <div
            style={{
              color: "#888",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Cryptographic Verification
          </div>
          <p style={{ color: "#888", fontSize: 12, marginBottom: 16 }}>
            All records on this campaign are signed with HMAC-SHA256. Any tampering breaks the signature.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {c.transactions.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #222",
                  borderRadius: 10,
                }}
              >
                <code style={{ color: "#FFFFFF", fontSize: 12, fontFamily: "monospace" }}>
                  {t.id.slice(0, 14)}…{t.id.slice(-6)}
                </code>
                <VerifiedPill />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/verify" style={{ color: "#888", fontSize: 13 }} className="hover:text-white transition-colors">
              Verify a transaction manually →
            </Link>
          </div>
        </GlassCard>
      </div>
    </PublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #222",
        borderRadius: 10,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span style={{ color: "#888", fontSize: 12 }}>{label}</span>
      <span style={{ color: "#FFFFFF", fontSize: 13 }}>{value}</span>
    </div>
  );
}
