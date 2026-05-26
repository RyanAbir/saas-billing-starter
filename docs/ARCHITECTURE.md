# Architecture Guide

## High-Level Architecture

User -> Next.js App -> Clerk Auth -> Prisma/Neon
Pricing -> Checkout API -> Stripe Checkout -> Stripe Webhook -> Database
Billing -> Portal API -> Stripe Customer Portal -> Webhook -> Database

## Important Backend Routes

- `/api/stripe/checkout`
- `/api/stripe/webhook`
- `/api/stripe/portal`

## Key Data Model

### User

Stores identity, Stripe customer mapping, subscription status, subscription plan, current period, and scheduled cancellation metadata.

### Project

Stores user-owned projects and supports server-side plan gating for Free vs Pro limits.

## Subscription Source of Truth

Stripe webhook events update the local database. UI pages read from Prisma/Neon rather than trusting client-side checkout results.

## Access Control Model

- Pro access = `subscriptionStatus === "active"` and `subscriptionPlan` starts with `"pro"`.
- Scheduled cancellation still allows access until the cancellation/access date.
- Feature limits are enforced server-side, not only in UI.
