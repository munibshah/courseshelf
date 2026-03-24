import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <Skeleton className="mb-2 h-9 w-40" />
        <Skeleton className="mb-8 h-5 w-56" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0">
                <Skeleton className="h-6 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
