import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AppShell,
  GlassCard,
  PrimaryButton,
  ProgressBar,
  SectionLabel,
  TrustBadge,
  formatNGN,
  useAuthGuard,
  useReveal,
} from "@/components/AppShell";
import { campaigns, getCampaign } from "@/lib/campaigns";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Home — TRACE" }] }),
});

const activity = [
  { id: "97c85343-81da-4233-8d67-e92479f330f5", amount: 25_000 },
  { id: "408f966e-e8d8-4ac7-978b-954380b6677c", amount: 10_000 },
  { id: "0836ab30-0949-4b23-bda0-2f084fb84caa", amount: 5_000 },
] as const;

const saved = [
  "fb5799e5-3d2b-4231-b5d7-15694fdcaac6",
  "97c85343-81da-4233-8d67-e92479f330f5",
] as const;

function HomePage() {
  const { user, ready } = useAuthGuard();
  const navigate = useNavigate();
  useReveal([ready]);
  if (!ready) return null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8 reveal">
        <h1 style={{ color: "#FFFFFF", fontSize: 20, fontFamily: "inherit" }}>
          {greet}, @{user?.username}
        </h1>
        <PrimaryButton onClick={() => navigate({ to: "/campaign/new" })}>
          + Create Campaign
        </PrimaryButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "65fr 35fr", gap: 24 }}>
        <div>
          <div className="reveal">
            <SectionLabel>Active Campaigns</SectionLabel>
          </div>
          <div className="flex flex-col gap-4">
            {campaigns.map((c) => (
              <GlassCard key={c.id} style={{ padding: 24 }}>
                <div className="reveal">
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
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div>
          <div className="reveal">
            <SectionLabel>Your Activity</SectionLabel>
          </div>
          <GlassCard style={{ padding: 0, marginBottom: 24 }}>
            {activity.map((a, i) => {
              const c = getCampaign(a.id)!;
              return (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < activity.length - 1 ? "1px solid #222" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ color: "#FFFFFF", fontSize: 13, flex: 1 }}>{c.name}</div>
                  <div style={{ color: "#FFFFFF", fontSize: 13 }}>{formatNGN(a.amount)}</div>
                  <TrustBadge level={c.trust} />
                </div>
              );
            })}
          </GlassCard>

          <div className="reveal">
            <SectionLabel>Saved Campaigns</SectionLabel>
          </div>
          <div className="flex flex-col gap-3">
            {saved.map((id) => {
              const c = getCampaign(id)!;
              return (
                <GlassCard key={id} style={{ padding: 16 }}>
                  <div style={{ color: "#FFFFFF", fontSize: 14, marginBottom: 4 }}>{c.name}</div>
                  <div className="flex items-center justify-between">
                    <div style={{ color: "#888", fontSize: 12 }}>{c.org}</div>
                    <TrustBadge level={c.trust} />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
