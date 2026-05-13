import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Search, User, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { supabase } from "@/integrations/supabase/client";

type SessionUser = {
  id: string;
  email?: string;
  username: string;
  joinedAt?: string;
};

export function useAuthGuard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session;
      if (!s) {
        navigate({ to: "/login" });
        return;
      }
      const u = s.user;
      const username =
        (u.user_metadata?.username as string) ||
        (u.email ? u.email.split("@")[0] : "user");
      setUser({
        id: u.id,
        email: u.email ?? undefined,
        username,
        joinedAt: u.created_at,
      });
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/login" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return { user, ready };
}

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
] as const;

function Sidebar() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 220,
        height: "100vh",
        background: "#141414",
        borderRight: "1px solid #222222",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      <div style={{ padding: 24 }}>
        <img src="/assets/img/logo-full.png" alt="TRACE" style={{ height: 28 }} />
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 12px", flex: 1 }}>
        {navItems.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                borderRadius: 12,
                color: active ? "#FFFFFF" : "#888888",
                borderLeft: active ? "2px solid #FFFFFF" : "2px solid transparent",
                transition: "color 0.2s ease",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "8px 12px 24px" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 12,
            color: "#888888",
            background: "transparent",
            width: "100%",
            fontFamily: "inherit",
            fontSize: 14,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ParticleNetwork subtle />
      <Sidebar />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          marginLeft: 220,
          minHeight: "100vh",
          padding: "32px 40px",
        }}
      >
        {children}
      </main>
    </>
  );
}

// shared UI primitives
export function GlassCard({
  children,
  style,
  hover = true,
  className,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={(hover ? "glass-card " : "") + (className ?? "")}
      style={{
        background: hover ? undefined : "rgba(255,255,255,0.04)",
        backdropFilter: hover ? undefined : "blur(12px)",
        WebkitBackdropFilter: hover ? undefined : "blur(12px)",
        border: hover ? undefined : "1px solid #222222",
        borderRadius: 16,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type TrustLevel = "clean" | "watch" | "suspicious";

const trustMap: Record<TrustLevel, { label: string; color: string; bg: string }> = {
  clean: { label: "Clean", color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  watch: { label: "Watch", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  suspicious: { label: "Suspicious", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

export function TrustBadge({ level }: { level: TrustLevel }) {
  const t = trustMap[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        fontSize: 11,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: t.color,
        background: t.bg,
        border: `1px solid ${t.color}33`,
        borderRadius: 999,
      }}
    >
      {t.label}
    </span>
  );
}

export function PrimaryButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{
        background: "#FFFFFF",
        color: "#0A0A0A",
        borderRadius: 12,
        padding: "10px 18px",
        fontFamily: "inherit",
        fontSize: 13,
        letterSpacing: "0.03em",
        transition: "opacity 0.2s ease",
        ...rest.style,
      }}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        color: "#FFFFFF",
        fontSize: 14,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        background: "#222222",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "#FFFFFF",
          borderRadius: 999,
        }}
      />
    </div>
  );
}

export function useReveal(deps: ReadonlyArray<unknown> = []) {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function formatNGN(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export function VerifiedPill({ tampered = false }: { tampered?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tampered ? "#EF4444" : "#FFFFFF",
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${tampered ? "#EF4444" : "#444444"}`,
        borderRadius: 999,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {tampered ? "✗ Tampered" : "✓ Verified"}
    </span>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ParticleNetwork subtle />
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(10,10,10,0.5)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #222222",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/">
          <img src="/assets/img/logo-full.png" alt="TRACE" style={{ height: 28, display: "block" }} />
        </Link>
        <Link
          to="/login"
          style={{
            color: "#888888",
            fontSize: 13,
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
          className="hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </header>
      <main style={{ position: "relative", zIndex: 1, padding: "40px 24px" }}>{children}</main>
    </>
  );
}
