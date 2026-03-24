import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createPurchase } from "@/lib/queries";
import { sendPurchaseConfirmation } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId, userId } = session.metadata ?? {};

    if (!courseId || !userId) {
      console.error("Missing metadata in checkout session:", session.id);
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    try {
      await createPurchase({
        user_id: userId,
        course_id: courseId,
        stripe_payment_id: session.payment_intent as string,
        amount: session.amount_total ?? 0,
      });

      // Send confirmation email (best-effort, don't fail the webhook)
      if (session.customer_details?.email) {
        sendPurchaseConfirmation({
          to: session.customer_details.email,
          courseName:
            session.line_items?.data?.[0]?.description ?? "your course",
          amount: session.amount_total ?? 0,
        }).catch((err) =>
          console.error("Failed to send purchase email:", err)
        );
      }
    } catch (err) {
      console.error("Failed to fulfill purchase:", err);
      return NextResponse.json(
        { error: "Failed to fulfill purchase" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
