import { CourseCohortsManager } from "@/components/admin/CourseCohortsManager";

export default function AdminCourseCohortsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">課程班期</h1>
        <p className="mt-1 text-sm text-brand-600">
          建立 8 週班期、自動產生課表，並可調整單週時間
        </p>
      </div>
      <CourseCohortsManager />
    </div>
  );
}
