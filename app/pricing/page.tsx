const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For building and testing your initial SaaS billing flow.",
    cta: "Current Plan",
    isPrimary: false,
  },
  {
    name: "Pro Monthly",
    price: "$9",
    period: "month",
    description: "For teams that need paid access with flexible monthly billing.",
    cta: "Choose Monthly",
    isPrimary: true,
  },
  {
    name: "Pro Yearly",
    price: "$90",
    period: "year",
    description: "Best value annual plan with a simplified yearly commitment.",
    cta: "Choose Yearly",
    isPrimary: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Pricing
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Select a plan layout for your billing flow. Checkout actions are static
          placeholders in this phase.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-zinc-900">{plan.name}</h2>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
              {plan.price}
              <span className="ml-1 text-sm font-medium text-zinc-500">/{plan.period}</span>
            </p>
            <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{plan.description}</p>
            <button
              type="button"
              className={
                plan.isPrimary
                  ? "mt-6 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  : "mt-6 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              }
            >
              {plan.cta}
            </button>
          </article>
        ))}
      </section>

      <p className="mt-8 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
        Stripe Checkout will be connected in a later phase.
      </p>
    </div>
  );
}
