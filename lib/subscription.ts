import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { inferPlanFromPriceId, isPaidPlanKey, type PaidPlanKey } from "@/lib/plans";

type PersistedSubscription = {
  subscriptionStatus: string;
  subscriptionPlan: "free" | PaidPlanKey;
  subscriptionPriceId: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date | null;
  currentPeriodEnd: Date | null;
};

function toDateFromUnix(unixSeconds: number | null | undefined): Date | null {
  if (!unixSeconds) {
    return null;
  }

  return new Date(unixSeconds * 1000);
}

function getPrimaryPriceId(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price?.id ?? null;
}

function getCurrentPeriodEndUnix(subscription: Stripe.Subscription): number | null {
  const rootPeriodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  if (typeof rootPeriodEnd === "number") {
    return rootPeriodEnd;
  }

  return subscription.items.data[0]?.current_period_end ?? null;
}

function getCancelAtUnix(subscription: Stripe.Subscription): number | null {
  const value = (subscription as unknown as { cancel_at?: number | null }).cancel_at;
  return typeof value === "number" ? value : null;
}

function getDerivedCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean {
  return Boolean(subscription.cancel_at_period_end || getCancelAtUnix(subscription));
}

function resolvePlan(
  metadataPlan: string | null | undefined,
  priceId: string | null,
): "free" | PaidPlanKey {
  if (metadataPlan && isPaidPlanKey(metadataPlan)) {
    return metadataPlan;
  }

  return inferPlanFromPriceId(priceId);
}

async function updateUserByStripeIdentity(
  params: {
    stripeCustomerId?: string | null;
    userId?: string | null;
    data: PersistedSubscription;
  },
) {
  const { stripeCustomerId, userId, data } = params;

  if (stripeCustomerId) {
    const updated = await prisma.user.updateMany({
      where: { stripeCustomerId },
      data,
    });

    if (updated.count > 0) {
      return updated.count;
    }
  }

  if (userId) {
    const updated = await prisma.user.updateMany({
      where: { id: userId },
      data,
    });

    if (updated.count > 0) {
      return updated.count;
    }
  }

  return 0;
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") {
    return { updatedUsers: 0 };
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    return { updatedUsers: 0 };
  }

  const stripe = (await import("@/lib/stripe")).stripe;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionPriceId = getPrimaryPriceId(subscription);
  const subscriptionPlan = resolvePlan(session.metadata?.plan, subscriptionPriceId);
  const cancelAtUnix = getCancelAtUnix(subscription);
  const derivedCancelAtPeriodEnd = getDerivedCancelAtPeriodEnd(subscription);

  const updatedUsers = await updateUserByStripeIdentity({
    stripeCustomerId: customerId,
    userId: session.metadata?.userId ?? null,
    data: {
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      subscriptionPriceId,
      cancelAtPeriodEnd: derivedCancelAtPeriodEnd,
      cancelAt: toDateFromUnix(cancelAtUnix),
      currentPeriodEnd: toDateFromUnix(getCurrentPeriodEndUnix(subscription)),
    },
  });

  return { updatedUsers };
}

export async function handleSubscriptionUpdated(
  webhookSubscription: Stripe.Subscription,
) {
  const subscriptionId = webhookSubscription.id;
  const stripe = (await import("@/lib/stripe")).stripe;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return { updatedUsers: 0 };
  }

  const subscriptionPriceId = getPrimaryPriceId(subscription);
  const subscriptionPlan = inferPlanFromPriceId(subscriptionPriceId);
  const cancelAtUnix = getCancelAtUnix(subscription);
  const derivedCancelAtPeriodEnd = getDerivedCancelAtPeriodEnd(subscription);

  const updatedUsers = await updateUserByStripeIdentity({
    stripeCustomerId: customerId,
    userId: subscription.metadata?.userId ?? webhookSubscription.metadata?.userId ?? null,
    data: {
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      subscriptionPriceId,
      cancelAtPeriodEnd: derivedCancelAtPeriodEnd,
      cancelAt: toDateFromUnix(cancelAtUnix),
      currentPeriodEnd: toDateFromUnix(getCurrentPeriodEndUnix(subscription)),
    },
  });

  return { updatedUsers };
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return { updatedUsers: 0 };
  }

  const updatedUsers = await updateUserByStripeIdentity({
    stripeCustomerId: customerId,
    userId: subscription.metadata?.userId ?? null,
    data: {
      subscriptionStatus: "canceled",
      subscriptionPlan: "free",
      subscriptionPriceId: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      currentPeriodEnd: null,
    },
  });

  return { updatedUsers };
}
