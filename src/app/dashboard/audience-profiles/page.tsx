import DashboardLayout from '@/components/dashboard/dashboard-layout';
import AudienceProfiles from '@/components/dashboard/audience-profiles';

export default function AudienceProfilesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <AudienceProfiles />
      </div>
    </DashboardLayout>
  );
}