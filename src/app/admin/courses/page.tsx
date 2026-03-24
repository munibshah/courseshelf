import { getAllCourses, getLessonsByCourseId } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/shared/link-button";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();

  const coursesWithLessonCount = await Promise.all(
    courses.map(async (course) => {
      const lessons = await getLessonsByCourseId(course.id);
      return { ...course, lessonCount: lessons.length };
    })
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <LinkButton href="/admin/courses/new" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Course
        </LinkButton>
      </div>

      {coursesWithLessonCount.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p>No courses yet. Create your first course to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coursesWithLessonCount.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={course.published ? "default" : "secondary"}
                    >
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(course.price)}</TableCell>
                  <TableCell>{course.lessonCount}</TableCell>
                  <TableCell>{formatDate(course.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <LinkButton
                      href={`/admin/courses/${course.id}`}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
