import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { LayoutDashboard, BookOpen, DollarSign } from "lucide-react";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").filter(Boolean);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
        <nav className="flex flex-col gap-1 p-4">
          <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </span>
          <LinkButton href="/admin" variant="ghost" size="sm" className="justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Overview
          </LinkButton>
          <LinkButton href="/admin/courses" variant="ghost" size="sm" className="justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Courses
          </LinkButton>
          <LinkButton href="/admin/revenue" variant="ghost" size="sm" className="justify-start">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenue
          </LinkButton>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
