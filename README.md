# SaaS Billing Starter

A production-style subscription billing system built with Next.js App Router and Stripe Billing.

## Features

- Clerk authentication
- Stripe Checkout subscription flow
- Stripe Customer Portal
- Webhook-based subscription sync
- Prisma + Neon PostgreSQL persistence
- Plan-based feature gating
- Free plan project limit
- Pro unlimited projects
- Scheduled cancellation handling

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Clerk
- Prisma
- Neon PostgreSQL
- Stripe Billing

## Architecture Flow

User -> Pricing Page -> Checkout API -> Stripe Checkout -> Webhook -> Database -> Dashboard/Billing -> Customer Portal

## Documentation

- [Demo Guide](docs/DEMO_GUIDE.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Security Notes](SECURITY.md)

## Screenshots

![Landing page](docs/screenshots/Landing%20page.png)
![Pricing page](docs/screenshots/Pricing%20page.png)
![Dashboard with Pro plan](docs/screenshots/Dashboard%20with%20Pro%20plan.png)
![Stripe Checkout page](docs/screenshots/Stripe%20Checkout%20page.png)
![Billing page with scheduled cancellation state](docs/screenshots/Billing%20page%20with%20scheduled%20cancellation%20state.png)
![Stripe Customer Portal showing active-scheduled cancellation](docs/screenshots/Stripe%20Customer%20Portal%20showing%20active-scheduled%20cancellation.png)

More screenshots are available in [`docs/screenshots/`](docs/screenshots/).

## Environment Variables

Create a `.env.local` file in the project root and use placeholder values like below:

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
```

## Local Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Stripe Webhooks (Local)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Stripe Test Card

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

## MVP User Flow

Sign in -> choose plan -> checkout -> webhook sync -> billing page updates -> manage/cancel from portal

## Current Limitations

- Test mode only
- No team billing
- No coupons
- No trials
- No usage-based billing
- No deployment webhook setup yet

## Portfolio Note

This project demonstrates a real subscription lifecycle end-to-end, not just a checkout button. It includes authenticated billing, persistent subscription state, webhook-driven source of truth, cancellation lifecycle handling, and server-side feature gating.
