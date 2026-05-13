import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  AppShell,
  GlassCard,
  PrimaryButton,
  SectionLabel,
  useAuthGuard,
} from "@/components/AppShell";

export const Route = createFileRoute("/campaign/new")({
  component: NewCampaignPage,
  head: () => ({ meta: [{ title: "Launch a Campaign — TRACE" }] }),
});

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid #222222",
  borderRadius: 12,
  color: "#FFFFFF",
  fontFamily: "inherit",
  fontSize: 14,
  padding: "12px 14px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: 13,
  marginBottom: 8,
  display: "block",
};

const errStyle: React.CSSProperties = {
  color: "#EF4444",
  fontSize: 11,
  marginTop: 6,
};

type Form = {
  name: string;
  org: string;
  category: string;
  social: string;
  description: string;
  goal: string;
  endDate: string;
  bank: string;
  account: string;
  accountName: string;
  wallet: string;
};

function NewCampaignPage() {
  const { ready } = useAuthGuard();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState<Form>({
    name: "",
    org: "",
    category: "",
    social: "",
    description: "",
    goal: "",
    endDate: "",
    bank: "",
    account: "",
    accountName: "",
    wallet: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  if (!ready) return null;

  const set = (k: keyof Form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof Form)[] = [
      "name",
      "org",
      "category",
      "description",
      "goal",
      "endDate",
      "bank",
      "account",
      "accountName",
    ];
    const next: Partial<Record<keyof Form, string>> = {};
    required.forEach((k) => {
      if (!form[k].trim()) next[k] = "Required";
    });
    setErrors(next);
    if (Object.keys(next).length === 0) {
      navigate({ to: "/home" });
    }
  };

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 3 - files.length);
    setFiles((p) => [...p, ...arr].slice(0, 3));
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ color: "#FFFFFF", fontSize: 24, marginBottom: 6 }}>Launch a Campaign</h1>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>
          Everything contributors need to trust you, in one place.
        </p>

        <GlassCard style={{ padding: 32 }}>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <section>
              <SectionLabel>Identity</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Campaign Name" error={errors.name}>
                  <input
                    style={inputBase}
                    placeholder="What are you raising for?"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>
                <Field label="Organization Name" error={errors.org}>
                  <input
                    style={inputBase}
                    placeholder="Your name or org name"
                    value={form.org}
                    onChange={(e) => set("org", e.target.value)}
                  />
                </Field>
                <Field label="Category" error={errors.category}>
                  <select
                    style={{ ...inputBase, appearance: "none" }}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    <option value="" style={{ background: "#141414" }}>Select category</option>
                    {["Medical", "Education", "Relief", "Creative", "Community", "Other"].map((c) => (
                      <option key={c} value={c} style={{ background: "#141414" }}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Social Link">
                  <input
                    style={inputBase}
                    placeholder="Twitter/X or Instagram URL (optional)"
                    value={form.social}
                    onChange={(e) => set("social", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionLabel>The Campaign</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Description" error={errors.description}>
                  <textarea
                    rows={5}
                    style={{ ...inputBase, resize: "vertical" }}
                    placeholder="Tell contributors exactly what the funds will be used for"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </Field>
                <Field label="Goal Amount" error={errors.goal}>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                        fontSize: 14,
                      }}
                    >
                      ₦
                    </span>
                    <input
                      type="number"
                      style={{ ...inputBase, paddingLeft: 32 }}
                      placeholder="0.00"
                      value={form.goal}
                      onChange={(e) => set("goal", e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="End Date" error={errors.endDate}>
                  <input
                    type="date"
                    style={{ ...inputBase, colorScheme: "dark" }}
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section>
              <SectionLabel>Payment Details</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Bank Name" error={errors.bank}>
                  <input
                    style={inputBase}
                    placeholder="Your bank"
                    value={form.bank}
                    onChange={(e) => set("bank", e.target.value)}
                  />
                </Field>
                <Field label="Account Number" error={errors.account}>
                  <input
                    style={inputBase}
                    placeholder="10-digit account number"
                    value={form.account}
                    onChange={(e) => set("account", e.target.value)}
                  />
                </Field>
                <Field label="Account Name" error={errors.accountName}>
                  <input
                    style={inputBase}
                    placeholder="Account name"
                    value={form.accountName}
                    onChange={(e) => set("accountName", e.target.value)}
                  />
                </Field>
                <Field label="Crypto Wallet Address">
                  <input
                    style={inputBase}
                    placeholder="Optional — USDT TRC20 or any wallet address"
                    value={form.wallet}
                    onChange={(e) => set("wallet", e.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section>
              <div style={{ color: "#FFFFFF", fontSize: 13, marginBottom: 6 }}>
                Verification Documents
              </div>
              <div style={{ color: "#888", fontSize: 12, marginBottom: 12 }}>
                Upload CAC documents, ID, or any supporting evidence. This builds contributor trust.
              </div>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "1px dashed #222222",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Drop files here or click to upload
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/*"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
              {files.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {files.map((f, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid #222",
                        color: "#FFFFFF",
                        fontSize: 12,
                      }}
                    >
                      {f.name}
                      <button
                        type="button"
                        onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                        style={{ background: "transparent", color: "#888", fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div>
              <PrimaryButton
                type="submit"
                style={{ width: "100%", padding: "14px", fontSize: 14 }}
              >
                Launch Campaign
              </PrimaryButton>
              <p
                style={{
                  color: "#888",
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Your campaign will be publicly visible and cryptographically tracked from the moment it launches.
              </p>
            </div>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={errStyle}>{error}</div>}
    </div>
  );
}
