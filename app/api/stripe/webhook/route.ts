import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "@/lib/subscription";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }

  return secret;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (error) {
    console.error("Invalid Stripe webhook signature", error);
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await handleCheckoutSessionCompleted(session);
        return NextResponse.json({ received: true, type: event.type, ...result });
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await handleSubscriptionUpdated(subscription);
        return NextResponse.json({ received: true, type: event.type, ...result });
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const result = await handleSubscriptionDeleted(subscription);
        return NextResponse.json({ received: true, type: event.type, ...result });
      }

      default:
        return NextResponse.json({ received: true, type: event.type, ignored: true });
    }
  } catch (error) {
    console.error("Stripe webhook handler error", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
