import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripeClient } from "@/lib/stripe";
import { getCourseById, getUserPurchaseForCourse } from "@/lib/queries";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const courseId = body.courseId;
    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId parameter" },
        { status: 400 }
      );
    }

    const course = await getCourseById(courseId);
    if (!course || !course.published) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already purchased
    const existing = await getUserPurchaseForCourse(userId, courseId);
    if (existing) {
      return NextResponse.json({ alreadyPurchased: true, redirectUrl: `/courses/${courseId}/learn` });
    }

    if (course.price < 1) {
      return NextResponse.json(
        { error: "Course price must be at least $0.01" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const productData: { name: string; description?: string } = {
      name: course.title,
    };
    if (course.description) {
      productData.description = course.description;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course.id,
        userId,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${courseId}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", message, error);
    return NextResponse.json(
      { error: "Failed to create checkout session", detail: message },
      { status: 500 }
    );
  }
}
