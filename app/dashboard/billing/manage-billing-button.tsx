"use client";

import { useState } from "react";

type ManageBillingButtonProps = {
  hasStripeCustomer: boolean;
};

type PortalResponse = {
  url?: string;
  error?: string;
};

export function ManageBillingButton({ hasStripeCustomer }: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const payload = (await response.json()) as PortalResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to open billing portal.");
      }

      window.location.assign(payload.url);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to open billing portal.";

      setIsLoading(false);
      setError(message);
    }
  }

  if (!hasStripeCustomer) {
    return (
      <>
        <button
          type="button"
          disabled
          className="mt-6 cursor-not-allowed rounded-md bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-500"
        >
          Manage Billing
        </button>
        <p className="mt-3 text-sm text-zinc-600">
          No Stripe customer found for this account yet.
        </p>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        disabled={isLoading}
        className="mt-6 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isLoading ? "Opening Portal..." : "Manage Billing"}
      </button>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
