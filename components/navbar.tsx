import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            SaaS
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-900">
            Billing Starter
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium text-zinc-600">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-2 py-1 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <Show when="signed-in">
              <li>
                <Link
                  href="/dashboard"
                  className="rounded-md px-2 py-1 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/billing"
                  className="rounded-md px-2 py-1 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  Billing
                </Link>
              </li>
            </Show>
          </ul>

          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Get Started
              </Link>
            </div>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}
