import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { ManageBillingButton } from "./manage-billing-button";

function formatDate(value: Date | null): string {
  if (!value) {
    return "Not applicable";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

function titleCase(value: string): string {
  if (!value) {
    return "Free";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function BillingPage() {
  const dbUser = await getOrCreateCurrentDbUser();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Billing</h1>

      <section className="mt-6 max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Billing Status</h2>
        <dl className="mt-5 space-y-3 text-sm text-zinc-700">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <dt className="font-medium text-zinc-500">Current plan</dt>
            <dd className="font-semibold text-zinc-900">
              {titleCase(dbUser?.subscriptionPlan ?? "free")}
            </dd>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <dt className="font-medium text-zinc-500">Subscription status</dt>
            <dd className="font-semibold text-zinc-900">
              {titleCase(dbUser?.subscriptionStatus ?? "free")}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-medium text-zinc-500">Renewal date</dt>
            <dd className="font-semibold text-zinc-900">
              {formatDate(dbUser?.currentPeriodEnd ?? null)}
            </dd>
          </div>
        </dl>

        <ManageBillingButton hasStripeCustomer={Boolean(dbUser?.stripeCustomerId)} />
      </section>
    </div>
  );
}
