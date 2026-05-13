import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GlassCard,
  PrimaryButton,
  PublicShell,
  VerifiedPill,
  formatNGN,
} from "@/components/AppShell";
import { campaigns, findTransaction } from "@/lib/campaigns";

export const Route = createFileRoute("/verify")({
  component: VerifyTxPage,
  head: () => ({ meta: [{ title: "Verify Transaction — TRACE" }] }),
});

type Result =
  | { kind: "verified"; campaignName: string; amount: number; date: string; trustScore: number }
  | { kind: "tampered" }
  | null;

function VerifyTxPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<Result>(null);

  const onVerify = () => {
    const trimmed = id.trim();
    if (!trimmed) return;
    const found = findTransaction(trimmed);
    if (found) {
      setResult({
        kind: "verified",
        campaignName: found.campaign.name,
        amount: found.tx.amount,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        trustScore: found.campaign.trustScore,
      });
    } else {
      // Mock default success per spec
      const c = campaigns[0];
      setResult({
        kind: "verified",
        campaignName: c.name,
        amount: c.transactions[0].amount,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        trustScore: c.trustScore,
      });
    }
  };

  return (
    <PublicShell>
      <div style={{ maxWidth: 560, margin: "40px auto" }}>
        <GlassCard style={{ padding: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <img src="/assets/img/logo-full.png" alt="TRACE" style={{ height: 28 }} />
          </div>
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              textAlign: "center",
              fontFamily: "inherit",
              marginBottom: 8,
            }}
          >
            Verify a Transaction
          </h1>
          <p style={{ color: "#888", fontSize: 13, textAlign: "center", marginBottom: 24 }}>
            Paste a transaction ID to check its cryptographic signature.
          </p>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Paste transaction ID"
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #222222",
              borderRadius: 12,
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontSize: 14,
              outline: "none",
              marginBottom: 14,
            }}
          />
          <PrimaryButton onClick={onVerify} style={{ width: "100%", padding: "14px", fontSize: 14 }}>
            Verify
          </PrimaryButton>

          {result && result.kind === "verified" && (
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  color: "#22C55E",
                  fontSize: 26,
                  textAlign: "center",
                  letterSpacing: "0.08em",
                  marginBottom: 18,
                }}
              >
                ✓ VERIFIED
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Row label="Campaign" value={result.campaignName} />
                <Row
                  label="Amount"
                  value={`${result.amount < 0 ? "-" : ""}${formatNGN(Math.abs(result.amount))}`}
                />
                <Row label="Date" value={result.date} />
                <Row label="Trust Score" value={String(result.trustScore)} />
                <div
                  style={{
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid #222",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "#888", fontSize: 12 }}>Signature</span>
                  <VerifiedPill />
                </div>
              </div>
            </div>
          )}

          {result && result.kind === "tampered" && (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <div style={{ color: "#EF4444", fontSize: 24, letterSpacing: "0.08em", marginBottom: 12 }}>
                ✗ SIGNATURE INVALID
              </div>
              <p style={{ color: "#888", fontSize: 13 }}>
                This record has been altered. The original signature does not match.
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </PublicShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #222",
        borderRadius: 10,
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span style={{ color: "#888", fontSize: 12 }}>{label}</span>
      <span style={{ color: "#FFFFFF", fontSize: 13, textAlign: "right" }}>{value}</span>
    </div>
  );
}

