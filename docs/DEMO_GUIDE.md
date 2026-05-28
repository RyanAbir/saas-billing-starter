# Demo Guide

## Demo Goal

Show a complete SaaS billing lifecycle, not just a checkout button.

## Live Demo

- Canonical URL: [https://saas-billing-starter-one.vercel.app](https://saas-billing-starter-one.vercel.app)
- Billing mode: Stripe test mode

## Recommended Demo Order

1. Landing page
2. Pricing page
3. Sign in with Clerk
4. Dashboard as Free user
5. Stripe Checkout Pro Monthly
6. Stripe webhook updates database
7. Billing page shows Pro active
8. Project gating shows Pro unlimited
9. Customer Portal opens
10. Cancel subscription from portal
11. Billing page shows scheduled cancellation/access until

## Live Test Flow

Sign in -> Pricing -> Pro Monthly -> Stripe Checkout (test card) -> Success -> Billing.

## Screenshot Checklist

- Landing page
- Pricing cards
- Clerk sign-in
- Dashboard Free state
- Stripe Checkout page
- Success page
- Billing page active Pro state
- Customer Portal page
- Scheduled cancellation state
- Dashboard project limit/unlimited state

## Stripe Test Card

- Card number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits

## Duplicate Subscription Safeguard

If a user already has active Pro access, checkout session creation is blocked to prevent duplicate subscriptions. The user sees:

`You already have an active Pro subscription. Manage billing from your dashboard.`

## Local Commands

```bash
npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Portfolio Talking Points

- Auth protects dashboard and billing routes.
- Checkout does not update the local database directly.
- Stripe webhooks are the source of truth for subscription state.
- Customer Portal handles plan management and cancellation.
- The app handles active, canceled, and scheduled cancellation states.
- Plan gating is enforced server-side.
