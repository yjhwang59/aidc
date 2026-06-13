import { CourseProgramsManager } from "@/components/admin/CourseProgramsManager";

export default function AdminCourseProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">課程方案</h1>
        <p className="mt-1 text-sm text-brand-600">
          管理 8 週課程方案、級別與預設名額
        </p>
      </div>
      <CourseProgramsManager />
    </div>
  );
}
