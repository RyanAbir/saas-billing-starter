import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <section className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Payment Success</h1>
        <p className="mt-3 text-zinc-600">
          This placeholder confirms a completed payment. In a later phase, Stripe
          Checkout will redirect users here after a successful session.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}
