import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import {
  AppShell,
  GlassCard,
  ProgressBar,
  TrustBadge,
  formatNGN,
  useAuthGuard,
  useReveal,
} from "@/components/AppShell";
import { campaigns } from "@/lib/campaigns";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — TRACE" }] }),
});

type Filter = "All" | "Active" | "Completed" | "Flagged";

function SearchPage() {
  const { ready } = useAuthGuard();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  useReveal([ready]);

  const matches = useMemo(() => {
    return campaigns.map((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.org.toLowerCase().includes(q.toLowerCase());
      const matchesF = filter === "All" || c.status === filter;
      return matchesQ && matchesF;
    });
  }, [q, filter]);

  const visibleCount = matches.filter(Boolean).length;

  if (!ready) return null;

  const filters: Filter[] = ["All", "Active", "Completed", "Flagged"];

  return (
    <AppShell>
      <div className="reveal" style={{ position: "relative", marginBottom: 16 }}>
        <SearchIcon
          size={18}
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888",
          }}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search campaigns, organizations..."
          style={{
            width: "100%",
            height: 52,
            paddingLeft: 48,
            paddingRight: 20,
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid #222222",
            borderRadius: 16,
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <div className="flex gap-2 mb-8">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 12,
                letterSpacing: "0.04em",
                background: active ? "#FFFFFF" : "rgba(255,255,255,0.04)",
                color: active ? "#0A0A0A" : "#888888",
                border: active ? "1px solid #FFFFFF" : "1px solid #222222",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {visibleCount === 0 ? (
        <div
          style={{
            color: "#888",
            textAlign: "center",
            padding: "80px 0",
            fontSize: 14,
          }}
        >
          No campaigns found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {campaigns.map((c, i) => (
            <GlassCard
              key={c.id}
              style={{ padding: 20, display: matches[i] ? undefined : "none" }}
            >
              <div style={{ color: "#FFFFFF", fontSize: 15, marginBottom: 4 }}>{c.name}</div>
              <div style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>{c.org}</div>
              <ProgressBar value={c.raised} max={c.goal} />
              <div style={{ color: "#888", fontSize: 11, marginTop: 8 }}>
                {formatNGN(c.raised)} of {formatNGN(c.goal)}
              </div>
              <div className="flex items-center justify-between mt-4">
                <TrustBadge level={c.trust} />
                <Link
                  to="/campaign/$id"
                  params={{ id: c.id }}
                  style={{ color: "#888", fontSize: 12 }}
                  className="hover:text-white transition-colors"
                >
                  View →
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  );
}
