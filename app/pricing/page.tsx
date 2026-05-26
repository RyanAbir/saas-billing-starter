import { PLANS } from "@/lib/plans";
import { PricingClient } from "./pricing-client";

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Choose a plan and continue to secure Stripe Checkout to start or update
          your subscription.
        </p>
      </section>

      <PricingClient plans={PLANS} />
    </div>
  );
}
