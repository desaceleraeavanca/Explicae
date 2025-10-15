import DashboardLayout from '@/components/dashboard/dashboard-layout';
import SubscriptionStatus from '@/components/dashboard/subscription-status';

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <SubscriptionStatus />
      </div>
    </DashboardLayout>
  );
}