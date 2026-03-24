"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 px-6 py-24 text-center md:py-32">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Learn From the Best.{" "}
        <span className="text-primary/80">At Your Own Pace.</span>
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Premium video courses crafted by industry experts. No subscriptions, no
        fluff — just the skills you need to level up.
      </p>
      <div className="flex gap-4">
        <Link
          href="#courses"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Browse Courses
        </Link>
        <Link
          href="/sign-up"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
