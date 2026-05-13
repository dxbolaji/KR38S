import { ParticleNetwork } from "@/components/ParticleNetwork";
import { useEffect, useState, type ReactNode } from "react";

export function AuthShell({ children, maxWidth = 420 }: { children: ReactNode; maxWidth?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      <ParticleNetwork />
      <div
        className="relative min-h-screen flex items-center justify-center px-6 py-12"
        style={{ zIndex: 1 }}
      >
        <div
          className="w-full p-8"
          style={{
            maxWidth,
            borderRadius: 16,
            border: "1px solid #222222",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
          }}
        >
          <div className="flex justify-center mb-6">
            <img src="/assets/img/logo-full.png" alt="TRACE" style={{ height: 36 }} />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export const authInputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid #222222",
  borderRadius: 12,
  color: "#FFFFFF",
  padding: "12px 16px",
  width: "100%",
  fontFamily: "inherit",
  fontSize: 14,
  outline: "none",
};

export function AuthInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string }
) {
  const { prefix, style, onFocus, onBlur, ...rest } = props;
  const [focused, setFocused] = useState(false);
  const merged: React.CSSProperties = {
    ...authInputStyle,
    borderColor: focused ? "#444444" : "#222222",
    paddingLeft: prefix ? 32 : authInputStyle.padding ? "16px" : undefined,
    ...style,
  };
  if (prefix) {
    return (
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#888",
            fontSize: 14,
            pointerEvents: "none",
          }}
        >
          {prefix}
        </span>
        <input
          {...rest}
          style={merged}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </div>
    );
  }
  return (
    <input
      {...rest}
      style={merged}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
}

export function AuthButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="w-full uppercase tracking-wider text-sm transition-colors disabled:opacity-60"
      style={{
        background: "#FFFFFF",
        color: "#0A0A0A",
        borderRadius: 12,
        padding: "13px 16px",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

export function FieldError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>{msg}</p>
  );
}
