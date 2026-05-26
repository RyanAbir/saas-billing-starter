import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { inferPlanFromPriceId, isPaidPlanKey, type PaidPlanKey } from "@/lib/plans";

type PersistedSubscription = {
  subscriptionStatus: string;
  subscriptionPlan: "free" | PaidPlanKey;
  subscriptionPriceId: string | null;
  cancelAtPeriodEnd: boolean;
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
  return subscription.items.data[0]?.current_period_end ?? null;
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

  const updatedUsers = await updateUserByStripeIdentity({
    stripeCustomerId: customerId,
    userId: session.metadata?.userId ?? null,
    data: {
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      subscriptionPriceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      currentPeriodEnd: toDateFromUnix(getCurrentPeriodEndUnix(subscription)),
    },
  });

  return { updatedUsers };
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return { updatedUsers: 0 };
  }

  const subscriptionPriceId = getPrimaryPriceId(subscription);
  const subscriptionPlan = inferPlanFromPriceId(subscriptionPriceId);

  const updatedUsers = await updateUserByStripeIdentity({
    stripeCustomerId: customerId,
    userId: subscription.metadata?.userId ?? null,
    data: {
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      subscriptionPriceId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
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
      currentPeriodEnd: null,
    },
  });

  return { updatedUsers };
}
