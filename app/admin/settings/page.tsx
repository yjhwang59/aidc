import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">帳號設定</h1>
        <p className="mt-1 text-sm text-brand-600">
          修改後台登入密碼。
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
