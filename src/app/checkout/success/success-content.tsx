"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface SuccessContentProps {
  courseId: string | null;
  courseName: string;
  amount: number;
}

export function SuccessContent({ courseId, courseName, amount }: SuccessContentProps) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Payment Successful!</h1>
        <p className="mb-1 text-muted-foreground">
          You now have full access to{" "}
          <span className="font-medium text-foreground">{courseName}</span>.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Amount paid: {formatPrice(amount)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {courseId && (
            <Link
              href={`/courses/${courseId}/learn`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Start Learning
            </Link>
          )}
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
