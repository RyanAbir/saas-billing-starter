import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

function getDisplayName(
  user: Awaited<ReturnType<typeof currentUser>>,
): string {
  if (!user) {
    return "there";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (fullName) {
    return fullName;
  }

  return user.primaryEmailAddress?.emailAddress ?? "there";
}

export default async function DashboardPage() {
  const user = await currentUser();
  const displayName = getDisplayName(user);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-3 text-zinc-600">Welcome, {displayName}.</p>
        {/* Future phase: sync Clerk user to application database after sign-in. */}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Current Plan
          </h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">Free</p>
          <p className="mt-2 text-sm text-zinc-600">You are currently on the starter plan.</p>
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
