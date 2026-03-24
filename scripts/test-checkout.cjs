const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const Stripe = require("stripe");

async function testCheckout() {
  console.log("=== Checkout Debug Test ===\n");

  // 1. Check env vars
  const keys = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  for (const k of keys) {
    const v = process.env[k];
    console.log(`${k}: ${v ? v.slice(0, 12) + "..." : "MISSING!"}`);
  }
  console.log();

  // 2. Fetch a published course from Supabase
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: courses, error: dbErr } = await sb
    .from("courses")
    .select("*")
    .eq("published", true)
    .limit(1);

  if (dbErr) {
    console.error("DB Error:", dbErr.message);
    return;
  }
  if (!courses || courses.length === 0) {
    console.error("No published courses found!");
    return;
  }

  const course = courses[0];
  console.log("Course found:");
  console.log("  id:", course.id);
  console.log("  title:", course.title);
  console.log("  description:", JSON.stringify(course.description));
  console.log("  price:", course.price, "cents");
  console.log("  published:", course.published);
  console.log();

  // 3. Validate fields
  if (!course.description || course.description.trim() === "") {
    console.warn("WARNING: description is empty");
  }
  if (course.price < 1) {
    console.warn("WARNING: price is less than 1 cent");
  }

  // 4. Try creating a Stripe checkout session
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const productData = { name: course.title };
  if (course.description) {
    productData.description = course.description;
  }

  try {
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
        userId: "test_user_123",
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${course.id}`,
    });

    console.log("SUCCESS!");
    console.log("  session.id:", session.id);
    console.log("  session.url:", session.url);
  } catch (err) {
    console.error("STRIPE ERROR:");
    console.error("  message:", err.message);
    console.error("  type:", err.type);
    console.error("  code:", err.code);
    console.error("  param:", err.param);
  }
}

testCheckout().then(() => process.exit(0));
