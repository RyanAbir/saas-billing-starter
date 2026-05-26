import { NextResponse } from "next/server";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { stripe } from "@/lib/stripe";

function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable.");
  }

  return appUrl;
}

export async function POST() {
  try {
    const dbUser = await getOrCreateCurrentDbUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!dbUser.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user." },
        { status: 400 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${getAppUrl()}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error", error);
    return NextResponse.json(
      { error: "Could not create billing portal session. Please try again." },
      { status: 500 },
    );
  }
}
