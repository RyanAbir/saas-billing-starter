import Link from "next/link";

const features = [
  {
    title: "Stripe Checkout",
    description:
      "Host secure checkout for monthly and yearly subscriptions with minimal integration friction.",
  },
  {
    title: "Customer Portal",
    description:
      "Give customers a self-serve place to manage plans, payment methods, and invoices.",
  },
  {
    title: "Webhook Sync",
    description:
      "Keep subscription state synchronized between Stripe events and your product experience.",
  },
  {
    title: "Plan-based Access",
    description:
      "Gate premium features and usage limits based on billing plan and entitlement rules.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Portfolio MVP</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          SaaS Billing Starter
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-600 sm:text-lg">
          A production-style subscription billing foundation for SaaS apps,
          designed to help you launch account, pricing, and billing flows with a
          clean architecture.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/pricing"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            View Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-900">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
