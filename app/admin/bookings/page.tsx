import { BookingsManager } from "@/components/admin/BookingsManager";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">預約管理</h1>
        <p className="mt-1 text-sm text-brand-600">審核與管理客戶預約申請</p>
      </div>
      <BookingsManager />
    </div>
  );
}
