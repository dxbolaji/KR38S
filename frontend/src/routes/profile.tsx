import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AppShell,
  GlassCard,
  ProgressBar,
  TrustBadge,
  VerifiedPill,
  formatNGN,
  useAuthGuard,
  useReveal,
} from "@/components/AppShell";
import { getCampaign } from "@/lib/campaigns";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — TRACE" }] }),
});

const myCampaignIds = ["baddy-lasu-first", "baddy-lasu-second"] as const;

const history = [
  { id: "aunty-esther", amount: 25_000, date: "Apr 28, 2026" },
  { id: "osimhen-jersey", amount: 10_000, date: "Apr 12, 2026" },
  { id: "aunty-esther", amount: 15_000, date: "Mar 30, 2026" },
  { id: "osimhen-jersey", amount: 5_000, date: "Mar 18, 2026" },
] as const;

function ProfilePage() {
  const { user, ready } = useAuthGuard();
  const [tab, setTab] = useState<"campaigns" | "history">("campaigns");
  useReveal([ready, tab]);
  if (!ready) return null;

  const joined = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const totalContributed = history.reduce((sum, h) => sum + h.amount, 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <GlassCard style={{ padding: 28, marginBottom: 24 }} className="reveal">
          <div className="flex items-center gap-5 mb-6">
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: "#222222",
                border: "1px solid #444444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: 22,
                textTransform: "uppercase",
              }}
            >
              {user?.username?.[0] ?? "?"}
            </div>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: 18 }}>{user?.username}</div>
              <div style={{ color: "#888", fontSize: 14 }}>@{user?.username}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Joined {joined}</div>
            </div>
          </div>
          <div className="flex gap-12" style={{ borderTop: "1px solid #222", paddingTop: 20 }}>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: 20 }}>{myCampaignIds.length}</div>
              <div style={{ color: "#888", fontSize: 12 }}>Campaigns Created</div>
            </div>
            <div>
              <div style={{ color: "#FFFFFF", fontSize: 20 }}>{formatNGN(totalContributed)}</div>
              <div style={{ color: "#888", fontSize: 12 }}>Total Contributed</div>
            </div>
          </div>
        </GlassCard>

        <div className="flex gap-6 mb-6" style={{ borderBottom: "1px solid #222" }}>
          {(
            [
              ["campaigns", "My Campaigns"],
              ["history", "Contribution History"],
            ] as const
          ).map(([k, label]) => {
            const active = tab === k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  background: "transparent",
                  color: active ? "#FFFFFF" : "#888888",
                  borderBottom: active ? "2px solid #FFFFFF" : "2px solid transparent",
                  padding: "12px 4px",
                  fontFamily: "inherit",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  transition: "color 0.2s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {tab === "campaigns" ? (
          <div className="flex flex-col gap-4">
            {myCampaignIds.map((id) => {
              const c = getCampaign(id)!;
              return (
                <GlassCard key={c.id} style={{ padding: 24 }}>
                  <div style={{ color: "#FFFFFF", fontSize: 16, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>{c.org}</div>
                  <ProgressBar value={c.raised} max={c.goal} />
                  <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                    {formatNGN(c.raised)} raised of {formatNGN(c.goal)} goal
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <TrustBadge level={c.trust} />
                    <Link
                      to="/campaign/$id"
                      params={{ id: c.id }}
                      style={{ color: "#888", fontSize: 13 }}
                      className="hover:text-white transition-colors"
                    >
                      View Campaign →
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard style={{ padding: 0 }}>
            {history.map((h, i) => {
              const c = getCampaign(h.id)!;
              return (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < history.length - 1 ? "1px solid #222" : "none",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto auto",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ color: "#FFFFFF", fontSize: 13 }}>{c.name}</div>
                  <div style={{ color: "#FFFFFF", fontSize: 13 }}>{formatNGN(h.amount)}</div>
                  <div style={{ color: "#888", fontSize: 12 }}>{h.date}</div>
                  <TrustBadge level={c.trust} />
                  <VerifiedPill />
                </div>
              );
            })}
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
