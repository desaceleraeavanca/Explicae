"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Bell, CreditCard, Shield, Palette, Zap } from "lucide-react"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="profile" className="gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Perfil</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Notificações</span>
        </TabsTrigger>
        <TabsTrigger value="plan" className="gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Plano</span>
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-2">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Preferências</span>
        </TabsTrigger>
        <TabsTrigger value="api" className="gap-2">
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">API</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Segurança</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais e profissionais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                JD
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Alterar Foto
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máx 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" placeholder="João" defaultValue="João" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" placeholder="Silva" defaultValue="Silva" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="joao@exemplo.com" defaultValue="joao@exemplo.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função/Cargo</Label>
              <Input id="role" placeholder="Ex: Professor, Gerente de Marketing" defaultValue="Professor" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você e como usa o Explicaê..."
                defaultValue="Educador apaixonado por tornar conceitos complexos acessíveis a todos."
                rows={4}
              />
            </div>

            <Button className="bg-primary hover:bg-primary/90">Salvar Alterações</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificação</CardTitle>
            <CardDescription>Escolha como e quando deseja receber notificações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Faísca Diária</Label>
                  <p className="text-sm text-muted-foreground">Receba uma analogia inspiradora todos os dias</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Conquistas</Label>
                  <p className="text-sm text-muted-foreground">Notificações quando você desbloquear badges</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dicas de Uso</Label>
                  <p className="text-sm text-muted-foreground">Receba dicas para aproveitar melhor o Explicaê</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Atualizações de Produto</Label>
                  <p className="text-sm text-muted-foreground">Novidades e recursos do Explicaê</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter Semanal</Label>
                  <p className="text-sm text-muted-foreground">Resumo semanal das suas atividades</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label className="mb-3 block">Canais de Notificação</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Email</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Push (Navegador)</Label>
                  <Switch />
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90">Salvar Preferências</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Plan Tab */}
      <TabsContent value="plan" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Plano Atual</CardTitle>
            <CardDescription>Gerencie sua assinatura e uso de créditos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Plano Profissional</h3>
                  <Badge className="bg-primary">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Renovação em 15 de Maio de 2025</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">R$ 49,90</p>
                <p className="text-sm text-muted-foreground">/mês</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analogias geradas este mês</span>
                <span className="font-medium">127 / 500</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "25.4%" }} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Faíscas disponíveis</span>
                <span className="font-medium">45</span>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Comprar Mais Faíscas
              </Button>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-semibold">Recursos Incluídos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  500 analogias por mês
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Dialetos de audiência ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Analisador de clareza avançado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Acesso à API
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Suporte prioritário
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                Alterar Plano
              </Button>
              <Button variant="outline" className="flex-1 text-destructive hover:text-destructive bg-transparent">
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>Suas últimas transações.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "01 Abr 2025", amount: "R$ 49,90", status: "Pago" },
                { date: "01 Mar 2025", amount: "R$ 49,90", status: "Pago" },
                { date: "01 Fev 2025", amount: "R$ 49,90", status: "Pago" },
              ].map((payment, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.date}</p>
                    <p className="text-sm text-muted-foreground">Plano Profissional</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{payment.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Preferences Tab */}
      <TabsContent value="preferences" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Geração</CardTitle>
            <CardDescription>Configure como suas analogias são geradas por padrão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTone">Tom Padrão</Label>
              <Select defaultValue="friendly">
                <SelectTrigger id="defaultTone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Acadêmico</SelectItem>
                  <SelectItem value="humorous">Bem-humorado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultAudience">Audiência Padrão</Label>
              <Select defaultValue="general">
                <SelectTrigger id="defaultAudience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Público Geral</SelectItem>
                  <SelectItem value="students">Estudantes</SelectItem>
                  <SelectItem value="professionals">Profissionais</SelectItem>
                  <SelectItem value="children">Crianças</SelectItem>
                  <SelectItem value="experts">Especialistas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-salvar Analogias</Label>
                <p className="text-sm text-muted-foreground">Salvar automaticamente analogias geradas</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sugestões de Melhoria</Label>
                <p className="text-sm text-muted-foreground">Mostrar dicas durante a geração</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button className="bg-primary hover:bg-primary/90">Salvar Preferências</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Personalize a interface do Explicaê.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select defaultValue="light">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select defaultValue="pt-BR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-primary hover:bg-primary/90">Salvar Aparência</Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* API Tab */}
      <TabsContent value="api" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Acesso à API</CardTitle>
            <CardDescription>Integre o Explicaê com suas aplicações.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Sua Chave de API</p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline">Copiar</Button>
                <Button variant="outline">Regenerar</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requisições este mês</span>
                <span className="font-medium">1,247 / 10,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-secondary-foreground h-2 rounded-full" style={{ width: "12.47%" }} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Documentação</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#" target="_blank" rel="noreferrer">
                    Ver Documentação da API
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#" target="_blank" rel="noreferrer">
                    Exemplos de Código
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Segurança da Conta</CardTitle>
            <CardDescription>Mantenha sua conta segura e protegida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" type="password" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" type="password" className="mt-2" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Alterar Senha</Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Sessões Ativas</h4>
              <div className="space-y-3">
                {[
                  { device: "Chrome no Windows", location: "São Paulo, Brasil", current: true },
                  { device: "Safari no iPhone", location: "São Paulo, Brasil", current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                      {session.current && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Sessão Atual
                        </Badge>
                      )}
                    </div>
                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        Encerrar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full text-destructive hover:text-destructive bg-transparent">
                Excluir Conta
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Esta ação é permanente e não pode ser desfeita.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
