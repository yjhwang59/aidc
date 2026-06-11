import { SlotsManager } from "@/components/admin/SlotsManager";

export default function AdminSlotsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">時段管理</h1>
        <p className="mt-1 text-sm text-brand-600">建立與管理可預約的諮詢時段</p>
      </div>
      <SlotsManager />
    </div>
  );
}
