import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthInput, AuthButton, FieldError } from "@/components/AuthShell";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — TRACE" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate({ to: "/home" });
  };

  return (
    <AuthShell maxWidth={520}>
      <h1 className="text-white text-center" style={{ fontSize: 22, marginBottom: 6 }}>
        Welcome back.
      </h1>
      <p className="text-center" style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        Sign in to your TRACE account.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthInput
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <div style={{ position: "relative" }}>
            <AuthInput
              type={showPw ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label="Toggle password"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888",
                background: "transparent",
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <a
              href="#"
              style={{ color: "#888", fontSize: 12 }}
              className="hover:text-white transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>
        <FieldError msg={error} />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </AuthButton>
      </form>
      <p className="text-center mt-6" style={{ color: "#888", fontSize: 13 }}>
        Don't have an account?{" "}
        <Link to="/signup" className="text-[#888] hover:text-white transition-colors underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
