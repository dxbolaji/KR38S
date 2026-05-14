import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthInput, AuthButton, FieldError } from "@/components/AuthShell";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — TRACE" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Required";
    if (!username.trim()) errs.username = "Required";
    if (!email.trim()) errs.email = "Required";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { full_name: fullName, username },
      },
    });
    if (error) {
      setLoading(false);
      return setErrors({ form: error.message });
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          full_name: fullName,
        });
      if (profileError && profileError.code !== '23505') {
        setLoading(false);
        return setErrors({ form: profileError.message });
      }
    }

    setLoading(false);
    navigate({ to: "/home" });
  };

  return (
    <AuthShell>
      <h1 className="text-white text-center" style={{ fontSize: 22, marginBottom: 6 }}>
        Create your account
      </h1>
      <p className="text-center" style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        Join TRACE and build financial trust.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <AuthInput
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <FieldError msg={errors.fullName} />
        </div>
        <div>
          <AuthInput
            prefix="@"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
          />
          <FieldError msg={errors.username} />
        </div>
        <div>
          <AuthInput
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <div style={{ position: "relative" }}>
            <AuthInput
              type={showPw ? "text" : "password"}
              placeholder="Create a password"
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
          <FieldError msg={errors.password} />
        </div>
        <FieldError msg={errors.form} />
        <AuthButton type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </AuthButton>
      </form>
      <p className="text-center mt-6" style={{ color: "#888", fontSize: 13 }}>
        Already have an account?{" "}
        <Link to="/login" className="text-[#888] hover:text-white transition-colors underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}