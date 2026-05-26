export const PLAN_KEYS = ["pro_monthly", "pro_yearly"] as const;

export type PaidPlanKey = (typeof PLAN_KEYS)[number];

type Plan = {
  key: "free" | PaidPlanKey;
  name: string;
  priceLabel: string;
  periodLabel: string;
  description: string;
};

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    priceLabel: "$0",
    periodLabel: "forever",
    description: "For building and testing your initial SaaS billing flow.",
  },
  {
    key: "pro_monthly",
    name: "Pro Monthly",
    priceLabel: "$9",
    periodLabel: "month",
    description: "For teams that need paid access with flexible monthly billing.",
  },
  {
    key: "pro_yearly",
    name: "Pro Yearly",
    priceLabel: "$90",
    periodLabel: "year",
    description: "Best value annual plan with a simplified yearly commitment.",
  },
];

const stripePriceIdByPlan: Record<PaidPlanKey, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
};

export function isPaidPlanKey(value: string): value is PaidPlanKey {
  return PLAN_KEYS.includes(value as PaidPlanKey);
}

export function getStripePriceIdForPlan(plan: PaidPlanKey): string {
  const priceId = stripePriceIdByPlan[plan];

  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan "${plan}".`);
  }

  return priceId;
}
