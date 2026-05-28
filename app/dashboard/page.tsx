import Link from "next/link";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createProjectAction, deleteProjectAction } from "./actions";
import { FREE_PROJECT_LIMIT, hasProAccess } from "@/lib/subscription-access";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DashboardProject = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const dbUser = await getOrCreateCurrentDbUser();
  if (!dbUser) {
    return null;
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const messageValue = resolvedSearchParams.message;
  const message = Array.isArray(messageValue) ? messageValue[0] : messageValue;

  const displayName = dbUser?.name || dbUser?.email || "there";
  const plan = dbUser?.subscriptionPlan ?? "free";
  const status = dbUser?.subscriptionStatus ?? "free";
  const cancelAtPeriodEnd = Boolean(dbUser?.cancelAtPeriodEnd);
  const isPro = hasProAccess(dbUser);

  const projects: DashboardProject[] = await prisma.project.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  const projectUsageLabel = isPro
    ? `${projects.length} / Unlimited`
    : `${projects.length} / ${FREE_PROJECT_LIMIT}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-3 text-zinc-600">Welcome, {displayName}.</p>
        <p className="mt-1 text-sm text-zinc-500">Account email: {dbUser?.email ?? "Not available"}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Subscription sync source: Stripe webhooks.
        </p>
        {message ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {message}
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Current Plan
          </h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{plan}</p>
          <p className="mt-2 text-sm text-zinc-600">Subscription status: {status}</p>
          <p className="mt-2 text-sm text-zinc-600">Projects used: {projectUsageLabel}</p>
          {cancelAtPeriodEnd ? (
            <p className="mt-2 text-sm text-amber-700">
              Your Pro access remains active until the scheduled cancellation date.
            </p>
          ) : null}
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">New Project</h2>
          <form action={createProjectAction} className="mt-3 space-y-3">
            <input
              type="text"
              name="title"
              required
              maxLength={80}
              placeholder="Project title"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-300 transition focus:border-zinc-400 focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Create Project
            </button>
          </form>
          {!isPro ? (
            <p className="mt-3 text-sm text-zinc-600">
              Free plan includes up to {FREE_PROJECT_LIMIT} projects. Upgrade to Pro for
              unlimited projects.
              <Link href="/pricing" className="ml-1 font-semibold text-zinc-900 underline">
                View Pricing
              </Link>
            </p>
          ) : null}
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No projects yet. Create your first project above.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{project.title}</p>
                  <p className="text-xs text-zinc-500">
                    Created {new Date(project.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
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
