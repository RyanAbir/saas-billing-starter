import Link from "next/link";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";

export default async function DashboardPage() {
  const dbUser = await getOrCreateCurrentDbUser();
  const displayName = dbUser?.name || dbUser?.email || "there";
  const plan = dbUser?.subscriptionPlan ?? "free";
  const status = dbUser?.subscriptionStatus ?? "free";
  const cancelAtPeriodEnd = Boolean(dbUser?.cancelAtPeriodEnd);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-3 text-zinc-600">Welcome, {displayName}.</p>
        <p className="mt-1 text-sm text-zinc-500">Account email: {dbUser?.email ?? "Not available"}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Subscription sync source: Stripe webhooks.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Current Plan
          </h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{plan}</p>
          <p className="mt-2 text-sm text-zinc-600">Subscription status: {status}</p>
          {cancelAtPeriodEnd ? (
            <p className="mt-2 text-sm text-amber-700">
              Your Pro access remains active until the current billing period ends.
            </p>
          ) : null}
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Gated Feature Demo
          </h2>
          <p className="mt-2 text-xl font-semibold text-zinc-900">Projects used: 0 / 3</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Upgrade to Pro to unlock unlimited projects and remove starter usage
            limits.
          </p>
        </article>
      </section>

      <div className="mt-6">
        <Link
          href="/dashboard/billing"
          className="inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
        >
          Go to Billing
        </Link>
      </div>
    </div>
  );
}
