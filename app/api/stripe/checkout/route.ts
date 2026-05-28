import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { getStripePriceIdForPlan, isPaidPlanKey, type PaidPlanKey } from "@/lib/plans";
import { hasProAccess } from "@/lib/subscription-access";
import { stripe } from "@/lib/stripe";

type CheckoutBody = {
  plan?: string;
};

function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable.");
  }

  return appUrl;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const requestedPlan = body.plan;

    if (!requestedPlan || !isPaidPlanKey(requestedPlan)) {
      return NextResponse.json(
        { error: "Invalid plan selection." },
        { status: 400 },
      );
    }

    const dbUser = await getOrCreateCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (hasProAccess(dbUser)) {
      return NextResponse.json(
        {
          error:
            "You already have an active Pro subscription. Manage billing from your dashboard.",
        },
        { status: 409 },
      );
    }

    const plan = requestedPlan as PaidPlanKey;
    const priceId = getStripePriceIdForPlan(plan);

    let stripeCustomerId = dbUser.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: {
          userId: dbUser.id,
          clerkUserId: dbUser.clerkUserId,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId },
      });
    }

    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        userId: dbUser.id,
        clerkUserId: dbUser.clerkUserId,
        plan,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create Stripe checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);

    return NextResponse.json(
      { error: "Could not create checkout session. Please try again." },
      { status: 500 },
    );
  }
}
