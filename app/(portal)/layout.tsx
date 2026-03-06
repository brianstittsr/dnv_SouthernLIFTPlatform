import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalHeader } from "@/components/portal/portal-header";
import { UserProfileProvider } from "@/contexts/user-profile-context";
import { ProfileCompletionWizard } from "@/components/portal/profile-completion-wizard";
import { AffiliateOnboardingWizard } from "@/components/portal/affiliate-onboarding-wizard";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserProfileProvider>
        <SidebarProvider>
          <PortalSidebar />
          <SidebarInset>
            <PortalHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <ProfileCompletionWizard />
        <AffiliateOnboardingWizard />
      </UserProfileProvider>
    </AuthGuard>
  );
}
