import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

export function getEmailClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY!);
}

interface PurchaseConfirmationParams {
  to: string;
  courseName: string;
  amount: number;
}

export async function sendPurchaseConfirmation({
  to,
  courseName,
  amount,
}: PurchaseConfirmationParams) {
  const client = getEmailClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return client.emails.send({
    from: "CourseShelf <noreply@courseshelf.com>",
    to,
    subject: `Your purchase: ${courseName}`,
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>You now have access to <strong>${courseName}</strong>.</p>
      <p>Amount paid: <strong>${formatPrice(amount)}</strong></p>
      <p><a href="${appUrl}/dashboard">Start learning →</a></p>
    `,
  });
}

interface WelcomeEmailParams {
  to: string;
  name: string;
}

export async function sendWelcomeEmail({ to, name }: WelcomeEmailParams) {
  const client = getEmailClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return client.emails.send({
    from: "CourseShelf <noreply@courseshelf.com>",
    to,
    subject: `Welcome to CourseShelf, ${name}!`,
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>We're glad to have you on CourseShelf.</p>
      <p><a href="${appUrl}/courses">Browse courses →</a></p>
    `,
  });
}
