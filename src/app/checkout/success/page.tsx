import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { SuccessContent } from "./success-content";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  const stripe = getStripeClient();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });
  } catch {
    redirect("/");
  }

  const courseId = session.metadata?.courseId ?? null;
  const courseName =
    session.line_items?.data?.[0]?.description ?? "your course";
  const amount = session.amount_total ?? 0;

  return (
    <SuccessContent
      courseId={courseId}
      courseName={courseName}
      amount={amount}
    />
  );
}
