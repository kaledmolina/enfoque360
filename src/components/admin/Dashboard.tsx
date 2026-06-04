'use client'

import React, { useEffect } from 'react'
import {
  FileText,
  CheckCircle2,
  FilePenLine,
  Clock,
  Users,
  Eye,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminStore, type Stats } from '@/store/admin-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface DashboardProps {
  isAdmin: boolean
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'default' as const
    case 'PENDING_REVIEW':
      return 'secondary' as const
    case 'DRAFT':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'PENDING_REVIEW':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    default:
      return ''
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PUBLISHED':
      return 'Publicado'
    case 'PENDING_REVIEW':
      return 'En Revisión'
    case 'DRAFT':
      return 'Borrador'
    default:
      return status
  }
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  trend?: string
}) {
  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold lg:text-3xl">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total de Artículos"
        value={stats.totalArticles}
        icon={<FileText className="h-6 w-6" />}
        description="Todos los artículos en el sistema"
      />
      <StatCard
        title="Publicados"
        value={stats.publishedArticles}
        icon={<CheckCircle2 className="h-6 w-6" />}
        description="Artículos publicados en vivo"
      />
      <StatCard
        title="Borradores"
        value={stats.draftArticles}
        icon={<FilePenLine className="h-6 w-6" />}
        description="Borradores sin publicar"
      />
      <StatCard
        title="Pendientes de Revisión"
        value={stats.pendingArticles}
        icon={<Clock className="h-6 w-6" />}
        description="Esperando revisión"
      />
      <StatCard
        title="Total de Usuarios"
        value={stats.totalUsers}
        icon={<Users className="h-6 w-6" />}
        description="Usuarios activos"
      />
      <StatCard
        title="Total de Vistas"
        value={stats.totalViews.toLocaleString()}
        icon={<Eye className="h-6 w-6" />}
        description="Vistas totales de artículos"
      />
    </div>
  )
}

function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_: unknown, i: number) => (
        <Card key={i}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentArticles({ stats }: { stats: Stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Artículos Recientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Título</TableHead>
                <TableHead className="hidden sm:table-cell">Autor</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-6 text-right">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="pl-6 font-medium max-w-[200px] truncate">
                    {article.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {article.author?.name || 'Desconocido'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {article.category?.name ? (
                      <Badge variant="outline" className="text-xs">
                        {article.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(article.status)}
                      className={getStatusBadgeColor(article.status)}
                    >
                      {getStatusLabel(article.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(article.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
              {stats.recentArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aún no hay artículos. ¡Empieza a escribir!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentLogs({ stats }: { stats: Stats }) {
  const getActionColor = (action: string) => {
    if (action.startsWith('ARTICLE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (action.startsWith('USER')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    if (action === 'LOGIN' || action === 'LOGOUT') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (action.startsWith('SETTINGS')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    if (action === 'ERROR') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Acción</TableHead>
                <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Detalles</TableHead>
                <TableHead className="pr-6 text-right">Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-6">
                    <Badge variant="outline" className={`text-xs ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {log.userName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.details || '—'}
                  </TableCell>
                  <TableCell className="pr-6 text-right text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
              {stats.recentLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aún no se ha registrado actividad.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function DashboardCharts({ stats }: { stats: Stats }) {
  const topArticlesData = stats.topArticles || []
  const categoriesData = stats.categoriesBreakdown || []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Popular Articles Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artículos Populares (Vistas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {topArticlesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topArticlesData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="title" 
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Estadísticas de vistas no disponibles aún.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artículos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            {categoriesData.length > 0 && categoriesData.some(c => c.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Estadísticas de categorías no disponibles aún.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard({ isAdmin }: DashboardProps) {
  const { stats, isLoading } = useAdminStore()

  useEffect(() => {
    useAdminStore.getState().fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {isLoading || !stats ? (
        <StatsGridSkeleton />
      ) : (
        <StatsGrid stats={stats} />
      )}

      {/* Interactive Charts */}
      {stats && <DashboardCharts stats={stats} />}

      {/* Recent Content */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentArticles stats={stats} />
          {isAdmin && <RecentLogs stats={stats} />}
        </div>
      )}
    </div>
  )
}
