import type { TrustLevel } from "@/components/AppShell";

export type CampaignStatus = "Active" | "Completed" | "Flagged";

export type CampaignTransaction = {
  id: string;
  label: string;
  amount: number;
  trust: TrustLevel;
  date?: string;
  verified?: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  org: string;
  goal: number;
  raised: number;
  status: CampaignStatus;
  trustScore: number;
  trust: TrustLevel;
  category: string;
  createdAt: string;
  endDate?: string;
  description: string;
  wallet?: string;
  transactions: CampaignTransaction[];
};

function txId(seed: string, i: number) {
  let h = 2166136261;
  const s = `${seed}-${i}`;
  for (let k = 0; k < s.length; k++) {
    h ^= s.charCodeAt(k);
    h = (h * 16777619) >>> 0;
  }
  const part1 = h.toString(16).padStart(8, "0");
  const part2 = ((h ^ 0x9e3779b9) >>> 0).toString(16).padStart(8, "0");
  return `tx_${part1}${part2}`;
}

function withIds(seed: string, txs: Omit<CampaignTransaction, "id" | "verified">[]): CampaignTransaction[] {
  return txs.map((t, i) => ({ ...t, id: txId(seed, i), verified: true }));
}

export const campaigns: Campaign[] = [
  {
    id: "fb5799e5-3d2b-4231-b5d7-15694fdcaac6",
    name: "Baddy of LASU — First Surgery Fund",
    org: "CrowdCare NG",
    goal: 20_000_000,
    raised: 28_900_453,
    status: "Completed",
    trustScore: 31,
    trust: "suspicious",
    category: "Medical",
    createdAt: "Jan 2025",
    endDate: "Feb 14, 2025",
    wallet: "TRC20-0xDEMO-baddy-first-1029384756",
    description:
      "Emergency surgery fund for Baddy of LASU's first leg. Campaign exceeded goal significantly. First surgery was completed but funds were not fully accounted for before a second campaign was launched. Caregiver was compensated ₦500,000. Remaining balance carry-forward was never publicly reconciled.",
    transactions: withIds("baddy-lasu-first", [
      { label: "Contribution from @support_ng", amount: 50_000, trust: "clean" },
      { label: "Withdrawal — Hospital Balance Payment", amount: -31_769, trust: "clean" },
      { label: "Withdrawal — Caregiver Compensation", amount: -500_000, trust: "watch" },
      { label: "Contribution from @donor_k", amount: 100_000, trust: "clean" },
      { label: "Withdrawal — Second Surgery Payment", amount: -4_500_000, trust: "suspicious" },
      { label: "Contribution from @anon_giver", amount: 25_000, trust: "clean" },
    ]),
  },
  {
    id: "0836ab30-0949-4b23-bda0-2f084fb84caa",
    name: "Baddy of LASU — Second Leg Surgery",
    org: "CrowdCare NG",
    goal: 19_000_000,
    raised: 15_800_000,
    status: "Active",
    trustScore: 22,
    trust: "suspicious",
    category: "Medical",
    createdAt: "Mar 2025",
    endDate: "Jun 30, 2025",
    wallet: "TRC20-0xDEMO-baddy-second-5647382910",
    description:
      "Second crowdfunding campaign launched for Baddy of LASU's second leg surgery, just weeks after the first campaign closed with over ₦28M raised and no public reconciliation. ₦19M target set. ₦15M raised within days. An additional ₦3.2M request followed. No accounting of first campaign funds provided before launch.",
    transactions: withIds("baddy-lasu-second", [
      { label: "Contribution from @wizarab10_fan", amount: 200_000, trust: "clean" },
      { label: "Contribution from @raise_am", amount: 500_000, trust: "clean" },
      { label: "Contribution from @anonymous_1", amount: 50_000, trust: "clean" },
      { label: "Withdrawal — Surgery Deposit", amount: -8_000_000, trust: "suspicious" },
      { label: "Contribution from @donor_wave", amount: 100_000, trust: "clean" },
      { label: "Withdrawal — Supplementary Request", amount: -3_200_000, trust: "suspicious" },
    ]),
  },
  {
    id: "97c85343-81da-4233-8d67-e92479f330f5",
    name: "Aunty Esther Medical Fund",
    org: "Public Trust Initiative",
    goal: 2_000_000,
    raised: 29_186_343,
    status: "Completed",
    trustScore: 81,
    trust: "clean",
    category: "Medical",
    createdAt: "Feb 2025",
    endDate: "Mar 15, 2025",
    wallet: "TRC20-0xDEMO-esther-9876543210",
    description:
      "Emergency medical fund for Aunty Esther. Campaign raised significantly beyond goal. Organizers stepped down due to patient's refusal of treatment on religious grounds. Remaining funds were transparently redirected to public benefit causes. Full accounting provided throughout.",
    transactions: withIds("aunty-esther", [
      { label: "Contribution from @kindheart_1", amount: 200_000, trust: "clean" },
      { label: "Withdrawal — Hospital Admission Deposit", amount: -1_000_000, trust: "clean" },
      { label: "Withdrawal — Treatment Payment", amount: -626_805, trust: "clean" },
      { label: "Contribution from @support_wave", amount: 500_000, trust: "clean" },
      { label: "Withdrawal — Caregiver Compensation (@AUNTYMUSE_)", amount: -500_000, trust: "clean" },
      { label: "Withdrawal — Public Redistribution", amount: -26_000_000, trust: "watch" },
    ]),
  },
  {
    id: "408f966e-e8d8-4ac7-978b-954380b6677c",
    name: "Osimhen Jersey Giveaway Fund",
    org: "Abazz Giveaways",
    goal: 300_000,
    raised: 300_000,
    status: "Completed",
    trustScore: 58,
    trust: "watch",
    category: "Community",
    createdAt: "Apr 2025",
    endDate: "Apr 30, 2025",
    wallet: "TRC20-0xDEMO-osimhen-1122334455",
    description:
      "Victor Osimhen-backed jersey giveaway. ₦300,000 received to purchase 15 jerseys for fans. Lighter player version jerseys were sourced instead of authentic versions. Organizer admitted fault publicly and offered full refunds or vendor transfer to winner representative. Partial resolution confirmed.",
    transactions: withIds("osimhen-jersey", [
      { label: "Contribution — Osimhen Sponsorship", amount: 300_000, trust: "clean" },
      { label: "Withdrawal — Jersey Procurement (10 units)", amount: -200_000, trust: "watch" },
      { label: "Withdrawal — Delivery Fees", amount: -15_000, trust: "clean" },
      { label: "Refund — Winner Reimbursement", amount: -20_000, trust: "clean" },
      { label: "Withdrawal — Remaining Jersey Fund", amount: -65_000, trust: "watch" },
    ]),
  },
  {
    id: "e2b58546-f746-43f9-9c50-c8938100fca3",
    name: "Hy'Donni Rebuild Fund",
    org: "Independent",
    goal: 1_000_000,
    raised: 193_545,
    status: "Active",
    trustScore: 54,
    trust: "watch",
    category: "Creative",
    createdAt: "Apr 2025",
    endDate: "May 8, 2025",
    wallet: "TRC20-0xDEMO-hydonni-7766554433",
    description:
      "Campaign by Nigerian digital creator Hy'Donni to stabilize her living situation and fund completion of digital creative projects. Campaign ran until May 8. Raised ₦193,545 of ₦1,000,000 goal. No public update was provided after funds were received. Spending pattern unverified.",
    transactions: withIds("hydonni-rebuild", [
      { label: "Contribution from @supporter_1", amount: 10_000, trust: "clean" },
      { label: "Contribution from @anonymous_2", amount: 5_000, trust: "clean" },
      { label: "Contribution from @voice_ng", amount: 50_000, trust: "clean" },
      { label: "Withdrawal — Living Stabilization", amount: -100_000, trust: "watch" },
      { label: "Contribution from @creative_fund", amount: 25_000, trust: "clean" },
      { label: "Withdrawal — Project Fund", amount: -93_545, trust: "watch" },
    ]),
  },
];

export function getCampaign(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}

export function findTransaction(id: string) {
  for (const c of campaigns) {
    const tx = c.transactions.find((t) => t.id === id);
    if (tx) return { tx, campaign: c };
  }
  return null;
}