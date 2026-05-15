import { createFileRoute } from "@tanstack/react-router";
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
} from "@/components/AppShell";
import { getCampaign } from "@/lib/campaigns";

export const Route = createFileRoute("/donate/$id")({
  component: DonatePage,
  head: ({ params }) => ({
    meta: [{ title: `Donate — ${getCampaign(params.id)?.name ?? "Campaign"}` }],
  }),
});

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid #222222",
  borderRadius: 12,
  color: "#FFFFFF",
  fontFamily: "inherit",
  outline: "none",
};

function DonatePage() {
  const { ready, user } = useAuthGuard();
  const { id } = Route.useParams();
  const c = getCampaign(id);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"local" | "international">("local");
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null;
  if (!c) {
    return (
      <AppShell>
        <GlassCard style={{ padding: 28 }}>
          <h1 style={{ color: "#FFFFFF", fontSize: 20 }}>Campaign not found</h1>
        </GlassCard>
      </AppShell>
    );
  }

  const trustColor = c.trustScore >= 75 ? "#22C55E" : c.trustScore >= 50 ? "#F59E0B" : "#EF4444";
  const aiInsight =
    c.trustScore >= 75
      ? "This campaign shows consistent contribution patterns with transparent withdrawals."
      : c.trustScore >= 50
        ? "This campaign has some flagged transactions worth monitoring."
        : "Multiple transactions on this campaign show suspicious withdrawal patterns.";

  const copyWallet = () => {
    if (!c.wallet) return;
    navigator.clipboard.writeText(c.wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDonation = async () => {
    if (!amount || Number(amount) < 1) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/transactions/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: c.id,
          amountNgn: Number(amount),
          email: user?.email || "donor@trace.com",
          donorName: user?.username || "Anonymous",
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.error || "Payment initiation failed");
      }
    } catch (err) {
      setError("Could not connect to payment server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <GlassCard style={{ padding: 28, marginBottom: 24 }}>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ color: "#FFFFFF", fontSize: 20, marginBottom: 4 }}>{c.name}</h1>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>{c.org}</div>
              <ProgressBar value={c.raised} max={c.goal} />
              <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                {formatNGN(c.raised)} raised of {formatNGN(c.goal)} goal
              </div>
            </div>
            <TrustBadge level={c.trust} />
          </div>
        </GlassCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <SectionLabel>Your Contribution</SectionLabel>
            <GlassCard style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#888",
                    fontSize: 22,
                  }}
                >
                  ₦
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    ...inputBase,
                    width: "100%",
                    padding: "16px 16px 16px 38px",
                    fontSize: 22,
                    textAlign: "center",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[1000, 5000, 10000, 50000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    style={{
                      ...inputBase,
                      padding: "8px 16px",
                      borderRadius: 999,
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                  >
                    ₦{v.toLocaleString()}
                  </button>
                ))}
              </div>
            </GlassCard>

            <SectionLabel>Payment Method</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {(
                [
                  { k: "local", label: "Local", sub: "Card, bank transfer, or USSD" },
                  { k: "international", label: "International", sub: "Crypto — USDT TRC20" },
                ] as const
              ).map((m) => {
                const active = method === m.k;
                return (
                  <button
                    key={m.k}
                    type="button"
                    onClick={() => setMethod(m.k)}
                    style={{
                      padding: 18,
                      borderRadius: 14,
                      border: active ? "1px solid #FFFFFF" : "1px solid #222222",
                      background: active ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                      color: "#FFFFFF",
                      fontFamily: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 14, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>{m.sub}</div>
                  </button>
                );
              })}
            </div>
            {method === "local" && (
              <div style={{ color: "#888", fontSize: 11, marginTop: 10 }}>Powered by Squad</div>
            )}
            {method === "international" && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #222",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <code
                  style={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.wallet}
                </code>
                <button
                  type="button"
                  onClick={copyWallet}
                  style={{
                    background: "transparent",
                    color: "#888",
                    fontFamily: "inherit",
                    fontSize: 12,
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Trust Summary</SectionLabel>
            <GlassCard style={{ padding: 24 }}>
              <div style={{ color: "#FFFFFF", fontSize: 14, marginBottom: 12 }}>Before you donate</div>
              <div style={{ color: trustColor, fontSize: 48, lineHeight: 1, marginBottom: 12 }}>
                {c.trustScore}
              </div>
              <div style={{ marginBottom: 16 }}>
                <VerifiedPill />
              </div>
              <p
                style={{
                  color: "#888",
                  fontSize: 13,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {aiInsight}
              </p>
              <p style={{ color: "#888", fontSize: 11, lineHeight: 1.5 }}>
                Every transaction on TRACE is cryptographically signed and publicly verifiable.
              </p>
            </GlassCard>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <PrimaryButton
            onClick={() => setConfirming(true)}
            style={{ width: "100%", padding: "14px", fontSize: 14 }}
          >
            Proceed to Payment
          </PrimaryButton>

          {confirming && (
            <GlassCard style={{ padding: 24, marginTop: 16 }}>
              <div style={{ color: "#FFFFFF", fontSize: 14, marginBottom: 14 }}>Confirm donation</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <Row label="Amount" value={amount ? `₦${Number(amount).toLocaleString()}` : "—"} />
                <Row label="Campaign" value={c.name} />
                <Row label="Method" value={method === "local" ? "Local Transfer" : "International (Crypto)"} />
              </div>
              {error && (
                <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 12 }}>{error}</div>
              )}
              <PrimaryButton
                style={{ width: "100%", padding: "12px", fontSize: 13 }}
                disabled={loading}
                onClick={handleConfirmDonation}
              >
                {loading ? "Processing..." : "Confirm Donation"}
              </PrimaryButton>
            </GlassCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #222",
        borderRadius: 10,
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span style={{ color: "#888", fontSize: 12 }}>{label}</span>
      <span style={{ color: "#FFFFFF", fontSize: 13 }}>{value}</span>
    </div>
  );
}