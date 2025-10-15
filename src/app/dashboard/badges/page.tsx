import DashboardLayout from '@/components/dashboard/dashboard-layout';
import Badges from '@/components/dashboard/badges';

export default function BadgesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Badges />
      </div>
    </DashboardLayout>
  );
}