"use client";

import { useState } from "react";

type Plan = {
  key: "free" | "pro_monthly" | "pro_yearly";
  name: string;
  priceLabel: string;
  periodLabel: string;
  description: string;
};

type PricingClientProps = {
  plans: Plan[];
};

type CheckoutState = {
  loadingPlan: "pro_monthly" | "pro_yearly" | null;
  error: string | null;
};

export function PricingClient({ plans }: PricingClientProps) {
  const [state, setState] = useState<CheckoutState>({
    loadingPlan: null,
    error: null,
  });

  async function startCheckout(plan: "pro_monthly" | "pro_yearly") {
    setState({ loadingPlan: plan, error: null });

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      setState({ loadingPlan: null, error: message });
    }
  }

  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isLoading = state.loadingPlan === plan.key;
          const paidPlanKey =
            plan.key === "pro_monthly" || plan.key === "pro_yearly" ? plan.key : null;

          return (
            <article
              key={plan.key}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{plan.name}</h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                {plan.priceLabel}
                <span className="ml-1 text-sm font-medium text-zinc-500">/{plan.periodLabel}</span>
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{plan.description}</p>

              {plan.key === "free" ? (
                <button
                  type="button"
                  disabled
                  className="mt-6 cursor-not-allowed rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-600"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (paidPlanKey) {
                      void startCheckout(paidPlanKey);
                    }
                  }}
                  disabled={state.loadingPlan !== null}
                  className={
                    plan.key === "pro_monthly"
                      ? "mt-6 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
                      : "mt-6 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                  }
                >
                  {isLoading
                    ? "Redirecting..."
                    : plan.key === "pro_monthly"
                      ? "Choose Monthly"
                      : "Choose Yearly"}
                </button>
              )}
            </article>
          );
        })}
      </section>

      <p className="mt-8 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
        Stripe Checkout is connected for Pro plans. Subscription status is
        synced by Stripe webhooks, and billing can be managed from the
        dashboard.
      </p>

      {state.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
    </>
  );
}
