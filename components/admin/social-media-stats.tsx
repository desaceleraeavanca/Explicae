"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  Share,
  Heart
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts"

// Dados mockados para desenvolvimento
const mockData = {
  platforms: [
    {
      name: "Instagram",
      icon: Instagram,
      followers: 12500,
      engagement: 3.8,
      growth: 2.4,
      color: "#E1306C"
    },
    {
      name: "Facebook",
      icon: Facebook,
      followers: 8700,
      engagement: 1.2,
      growth: -0.5,
      color: "#4267B2"
    },
    {
      name: "Twitter",
      icon: Twitter,
      followers: 5200,
      engagement: 2.1,
      growth: 1.8,
      color: "#1DA1F2"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      followers: 3800,
      engagement: 4.5,
      growth: 3.2,
      color: "#0077B5"
    },
    {
      name: "YouTube",
      icon: Youtube,
      followers: 2200,
      engagement: 6.7,
      growth: 5.1,
      color: "#FF0000"
    }
  ],
  engagementData: [
    { name: "Instagram", likes: 1250, comments: 320, shares: 180 },
    { name: "Facebook", likes: 870, comments: 150, shares: 210 },
    { name: "Twitter", likes: 520, comments: 280, shares: 350 },
    { name: "LinkedIn", likes: 380, comments: 90, shares: 120 },
    { name: "YouTube", likes: 650, comments: 420, shares: 80 }
  ],
  weeklyGrowth: [
    { day: "Seg", instagram: 45, facebook: 32, twitter: 28, linkedin: 15, youtube: 12 },
    { day: "Ter", instagram: 52, facebook: 35, twitter: 24, linkedin: 18, youtube: 14 },
    { day: "Qua", instagram: 58, facebook: 30, twitter: 32, linkedin: 22, youtube: 18 },
    { day: "Qui", instagram: 63, facebook: 28, twitter: 35, linkedin: 20, youtube: 15 },
    { day: "Sex", instagram: 70, facebook: 34, twitter: 30, linkedin: 25, youtube: 20 },
    { day: "Sáb", instagram: 75, facebook: 36, twitter: 26, linkedin: 22, youtube: 22 },
    { day: "Dom", instagram: 68, facebook: 30, twitter: 28, linkedin: 18, youtube: 16 }
  ],
  topPosts: [
    {
      id: "post1",
      platform: "Instagram",
      content: "Lançamento do novo curso de React",
      engagement: 1250,
      date: "2023-06-15"
    },
    {
      id: "post2",
      platform: "LinkedIn",
      content: "Vagas para desenvolvedores frontend",
      engagement: 980,
      date: "2023-06-10"
    },
    {
      id: "post3",
      platform: "Twitter",
      content: "Dica rápida: como usar hooks no React",
      engagement: 750,
      date: "2023-06-12"
    },
    {
      id: "post4",
      platform: "Facebook",
      content: "Webinar gratuito sobre carreira em tecnologia",
      engagement: 620,
      date: "2023-06-08"
    },
    {
      id: "post5",
      platform: "YouTube",
      content: "Tutorial: Criando sua primeira API com Node.js",
      engagement: 580,
      date: "2023-06-05"
    }
  ]
}

export function SocialMediaStats() {
  const getPlatformIcon = (platform) => {
    const icons = {
      Instagram: <Instagram className="h-4 w-4" style={{ color: "#E1306C" }} />,
      Facebook: <Facebook className="h-4 w-4" style={{ color: "#4267B2" }} />,
      Twitter: <Twitter className="h-4 w-4" style={{ color: "#1DA1F2" }} />,
      LinkedIn: <Linkedin className="h-4 w-4" style={{ color: "#0077B5" }} />,
      YouTube: <Youtube className="h-4 w-4" style={{ color: "#FF0000" }} />
    }
    return icons[platform] || null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2" style={{ backgroundColor: `${platform.color}20` }}>
                      <Icon className="h-5 w-5" style={{ color: platform.color }} />
                    </div>
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">{platform.followers.toLocaleString()} seguidores</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{platform.engagement}%</div>
                      <div className="text-xs text-muted-foreground">Engajamento</div>
                    </div>
                    <div className="flex items-center">
                      {platform.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`ml-1 ${platform.growth > 0 ? "text-green-500" : "text-red-500"}`}>
                        {Math.abs(platform.growth)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="growth" className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Análise de Redes Sociais</h2>
          <TabsList>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="growth" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Crescimento Semanal por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.weeklyGrowth}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} />
                  <Line type="monotone" dataKey="facebook" stroke="#4267B2" strokeWidth={2} />
                  <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} />
                  <Line type="monotone" dataKey="linkedin" stroke="#0077B5" strokeWidth={2} />
                  <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Engajamento por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.engagementData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" name="Curtidas" fill="#10b981" />
                  <Bar dataKey="comments" name="Comentários" fill="#3b82f6" />
                  <Bar dataKey="shares" name="Compartilhamentos" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Posts com Maior Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.topPosts.map((post) => (
              <div key={post.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                {getPlatformIcon(post.platform)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{post.content}</span>
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{Math.floor(post.engagement * 0.6)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{Math.floor(post.engagement * 0.3)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-3 w-3" />
                      <span>{Math.floor(post.engagement * 0.1)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(post.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}