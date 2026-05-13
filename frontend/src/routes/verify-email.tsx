import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthButton, FieldError } from "@/components/AuthShell";

export const Route = createFileRoute("/verify-email")({
  component: VerifyPage,
  head: () => ({ meta: [{ title: "Verify Email — TRACE" }] }),
});

function VerifyPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setEmail(sessionStorage.getItem("trace_verify_email") || "");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const setAt = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
    if (c && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!txt) return;
    e.preventDefault();
    const arr = txt.split("");
    const next = ["", "", "", "", "", ""];
    arr.forEach((c, i) => (next[i] = c));
    setDigits(next);
    refs.current[Math.min(arr.length, 5)]?.focus();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = digits.join("");
    if (code.length !== 6) return setError("Enter the full 6-digit code");
    if (!email) return setError("Missing email. Please sign up again.");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setLoading(false);
    if (error) return setError(error.message);
    sessionStorage.removeItem("trace_verify_email");
    navigate({ to: "/home" });
  };

  const onResend = async () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) return setError(error.message);
    setCooldown(60);
  };

  return (
    <AuthShell>
      <h1 className="text-white text-center" style={{ fontSize: 22, marginBottom: 6 }}>
        Check your inbox
      </h1>
      <p className="text-center" style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        We sent a 6-digit code to your email address.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              maxLength={1}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                border: "1px solid #222222",
                background: "rgba(255,255,255,0.05)",
                color: "#FFFFFF",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "inherit",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#444444")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#222222")}
            />
          ))}
        </div>
        <FieldError msg={error} />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </AuthButton>
      </form>
      <p className="text-center mt-6" style={{ color: "#888", fontSize: 13 }}>
        {cooldown > 0 ? (
          <>Code resent. Try again in {cooldown}s</>
        ) : (
          <>
            Didn't get it?{" "}
            <button
              type="button"
              onClick={onResend}
              className="text-[#888] hover:text-white transition-colors underline"
              style={{ background: "transparent" }}
            >
              Resend code
            </button>
          </>
        )}
      </p>
    </AuthShell>
  );
}
