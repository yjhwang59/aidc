import { CourseEnrollmentsManager } from "@/components/admin/CourseEnrollmentsManager";

export default function AdminCourseEnrollmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">課程報名</h1>
        <p className="mt-1 text-sm text-brand-600">
          審核課程報名、候補、取消與完成狀態
        </p>
      </div>
      <CourseEnrollmentsManager />
    </div>
  );
}
