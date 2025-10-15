import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function PaymentHistory() {
  // Placeholder - to be replaced with real payment data from Kiwify
  const payments = [
    {
      id: "1",
      user: "Aguardando integração com Kiwify",
      plan: "-",
      amount: "R$ 0,00",
      status: "pendente",
      date: new Date().toISOString(),
    },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Histórico de Pagamentos</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.user}</TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell className="font-medium">{payment.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline">{payment.status}</Badge>
                </TableCell>
                <TableCell>{new Date(payment.date).toLocaleDateString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Configure o webhook do Kiwify para rastrear pagamentos automaticamente
      </p>
    </Card>
  )
}
