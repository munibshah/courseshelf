const { createClient } = require("@supabase/supabase-js");

const sb = createClient(
  "https://puybtdslrjnvobutejpt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eWJ0ZHNscmpudm9idXRlanB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0MzMyNywiZXhwIjoyMDg5OTE5MzI3fQ.kU9Na5HRZxnnKtwIoTAq4JixrXO3G0mwT8vJlsvxoeA"
);

async function seed() {
  const { data, error } = await sb.from("courses").select("id").limit(1);
  if (error) {
    console.log("Tables not created yet:", error.message);
    console.log("Run the migration first in Supabase SQL Editor.");
    return;
  }
  console.log("Courses table exists.");

  const { data: courses, error: insertErr } = await sb
    .from("courses")
    .insert([
      {
        title: "Build a SaaS with Next.js & Stripe",
        description:
          "Learn to build and deploy a production-ready SaaS app from scratch using Next.js, Supabase, and Stripe.",
        price: 4999,
        published: true,
      },
      {
        title: "Master TypeScript in 30 Days",
        description:
          "Go from zero to confident TypeScript developer. Generics, utility types, advanced patterns, and real-world projects.",
        price: 2999,
        published: true,
      },
      {
        title: "AI-Powered Apps with LLMs",
        description:
          "Build intelligent apps using large language models. RAG, embeddings, prompt engineering, and production deployment.",
        price: 5999,
        published: true,
      },
    ])
    .select();

  if (insertErr) {
    console.log("Insert error:", insertErr.message);
    return;
  }
  console.log("Seeded", courses.length, "courses");

  const cid = courses[0].id;
  const { error: lErr } = await sb.from("lessons").insert([
    {
      course_id: cid,
      title: "Project Setup & Architecture",
      description: "Set up Next.js with TypeScript, Tailwind, and the full stack.",
      position: 0,
      is_preview: true,
      video_uid: "",
    },
    {
      course_id: cid,
      title: "Database Design with Supabase",
      description: "Design schema, set up RLS policies, and create migrations.",
      position: 1,
      is_preview: true,
      video_uid: "",
    },
    {
      course_id: cid,
      title: "Authentication with Clerk",
      description: "Implement sign-up, sign-in, and protected routes.",
      position: 2,
      is_preview: false,
      video_uid: "",
    },
    {
      course_id: cid,
      title: "Stripe Payments & Webhooks",
      description: "Set up checkout, handle webhooks, and fulfill purchases.",
      position: 3,
      is_preview: false,
      video_uid: "",
    },
    {
      course_id: cid,
      title: "Deploying to Production",
      description: "Deploy to Vercel, configure DNS, and go live.",
      position: 4,
      is_preview: false,
      video_uid: "",
    },
  ]);

  if (lErr) {
    console.log("Lesson insert error:", lErr.message);
    return;
  }
  console.log("Seeded 5 lessons for:", courses[0].title);
}

seed().then(() => process.exit(0));
