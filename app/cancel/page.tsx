import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <section className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Checkout Canceled</h1>
        <p className="mt-3 text-zinc-600">
          No payment was completed. You can return to pricing to review available
          plans and try checkout again later.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
        >
          Back to Pricing
        </Link>
      </section>
    </div>
  );
}
