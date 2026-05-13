import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AppShell,
  GlassCard,
  PrimaryButton,
  ProgressBar,
  SectionLabel,
  TrustBadge,
  VerifiedPill,
  formatNGN,
  useAuthGuard,
  useReveal,
} from "@/components/AppShell";
import { getCampaign } from "@/lib/campaigns";

export const Route = createFileRoute("/campaign/$id")({
  component: CampaignPage,
  head: ({ params }) => ({
    meta: [{ title: `${getCampaign(params.id)?.name ?? "Campaign"} — TRACE` }],
  }),
});

function CampaignPage() {
  const { ready } = useAuthGuard();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  useReveal([ready]);
  if (!ready) return null;

  const campaign = getCampaign(id);
  if (!campaign) {
    return (
      <AppShell>
        <GlassCard style={{ padding: 28 }}>
          <h1 style={{ color: "#FFFFFF", fontSize: 20 }}>Campaign not found</h1>
        </GlassCard>
      </AppShell>
    );
  }

  const { name, org, raised, goal, trustScore, transactions, description, category, createdAt } =
    campaign;
  const trustColor = trustScore >= 75 ? "#22C55E" : trustScore >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <AppShell>
      <GlassCard style={{ padding: 28, marginBottom: 24 }} className="reveal">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{ color: "#FFFFFF", fontSize: 24, marginBottom: 4 }}>{name}</h1>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{org}</div>
            <div className="flex gap-10 mb-5">
              <div>
                <div style={{ color: "#FFFFFF", fontSize: 20 }}>{formatNGN(raised)}</div>
                <div style={{ color: "#888", fontSize: 12 }}>Raised</div>
              </div>
              <div>
                <div style={{ color: "#FFFFFF", fontSize: 20 }}>{formatNGN(goal)}</div>
                <div style={{ color: "#888", fontSize: 12 }}>Goal</div>
              </div>
            </div>
            <ProgressBar value={raised} max={goal} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <PrimaryButton
                onClick={() => navigate({ to: "/donate/$id", params: { id } })}
                style={{ padding: "14px 28px", fontSize: 14 }}
              >
                Donate
              </PrimaryButton>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/c/${id}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{
                  padding: "14px 22px",
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
            </div>
            {copied && (
              <span style={{ color: "#22C55E", fontSize: 12 }}>Link copied</span>
            )}
          </div>
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 24 }}>
        <div>
          <div className="reveal">
            <SectionLabel>Live Transaction Feed</SectionLabel>
          </div>
          <GlassCard style={{ padding: 0, maxHeight: 600, overflowY: "auto" }}>
            {transactions.map((t, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 20px",
                  borderBottom: i < transactions.length - 1 ? "1px solid #222" : "none",
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

        <div className="flex flex-col gap-4">
          <GlassCard className="reveal">
            <SectionLabel>Campaign Details</SectionLabel>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              {description}
            </p>
            <div className="flex items-center gap-3">
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  color: "#888",
                  fontSize: 11,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {category}
              </span>
              <span style={{ color: "#888", fontSize: 12 }}>Created {createdAt}</span>
            </div>
          </GlassCard>

          <GlassCard className="reveal">
            <SectionLabel>Trust Score Overview</SectionLabel>
            <div style={{ color: trustColor, fontSize: 56, lineHeight: 1, marginBottom: 8 }}>
              {trustScore}
            </div>
            <div style={{ color: "#888", fontSize: 12 }}>
              Based on {transactions.length} transactions
            </div>
          </GlassCard>

          <GlassCard className="reveal">
            <div
              style={{
                color: "#888",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              AI Insight
            </div>
            <p style={{ color: "#FFFFFF", fontSize: 13, lineHeight: 1.6 }}>
              {trustScore >= 75
                ? "This campaign shows consistent contribution patterns with transparent withdrawals. No anomalous activity detected across the transaction history."
                : trustScore >= 50
                  ? "This campaign has some flagged transactions worth monitoring. Withdrawal patterns deviate from typical norms and warrant continued oversight."
                  : "Multiple transactions on this campaign show suspicious withdrawal patterns. Lack of public reconciliation and large unaccounted outflows significantly reduce the trust score."}
            </p>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
