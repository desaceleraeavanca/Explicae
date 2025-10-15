import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AnalogyGenerator } from '@/components/analogy/analogy-generator'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <AnalogyGenerator />
      </div>
    </DashboardLayout>
  )
}