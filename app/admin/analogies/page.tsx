import { AdminAnalogiesTable } from "@/components/admin-analogies-table"

export default function AdminAnalogiesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analogias</h1>
        <p className="text-muted-foreground mt-2">Visualize e modere todas as analogias criadas na plataforma.</p>
      </div>
      <AdminAnalogiesTable />
    </div>
  )
}
