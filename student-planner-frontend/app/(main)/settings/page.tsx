import { Header } from "@/components/layout/Header";
import { UpdateProfileForm } from "@/components/settings/UpdateProfileForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default function SettingsPage() {
  return (
    <div>
      <Header 
        title="Settings"
        subtitle="Manage your account and profile settings."
      />
      <div className="grid gap-8">
        <UpdateProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}