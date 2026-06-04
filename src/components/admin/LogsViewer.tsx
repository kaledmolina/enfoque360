'use client'

import React, { useEffect, useState } from 'react'
import { Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminStore } from '@/store/admin-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const LOG_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'ARTICLE_CREATE',
  'ARTICLE_UPDATE',
  'ARTICLE_DELETE',
  'ARTICLE_PUBLISH',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'CATEGORY_CREATE',
  'CATEGORY_UPDATE',
  'CATEGORY_DELETE',
  'TAG_CREATE',
  'TAG_UPDATE',
  'TAG_DELETE',
  'SETTINGS_UPDATE',
  'ERROR',
]

function getActionColor(action: string) {
  if (action.startsWith('ARTICLE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  if (action.startsWith('USER')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  if (action === 'LOGIN' || action === 'LOGOUT') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (action.startsWith('SETTINGS')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  if (action.startsWith('CATEGORY')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
  if (action.startsWith('TAG')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  if (action === 'ERROR') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export default function LogsViewer() {
  const {
    logs,
    logsTotal,
    logsPage,
    logsTotalPages,
    logActionFilter,
    fetchLogs,
    setLogActionFilter,
  } = useAdminStore()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs(1, logActionFilter || undefined).finally(() => setIsLoading(false))
  }, [fetchLogs, logActionFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > logsTotalPages) return
    setIsLoading(true)
    fetchLogs(newPage, logActionFilter || undefined).finally(() => setIsLoading(false))
  }

  const handleFilterChange = (value: string) => {
    setLogActionFilter(value === 'ALL' ? '' : value)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Registros de Actividad</h2>
          <p className="text-sm text-muted-foreground">
            {logsTotal} {logsTotal !== 1 ? 'registros en total' : 'registro en total'}
            {logActionFilter && ` · filtrado por ${logActionFilter.replace(/_/g, ' ')}`}
          </p>
        </div>
        <Select value={logActionFilter || 'ALL'} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todas las Acciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las Acciones</SelectItem>
            {LOG_ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full max-w-[300px]" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Acción</TableHead>
                    <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                    <TableHead className="hidden md:table-cell">Detalles</TableHead>
                    <TableHead className="hidden lg:table-cell">Dirección IP</TableHead>
                    <TableHead className="pr-6 text-right">Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="pl-6">
                        <Badge variant="outline" className={`text-xs whitespace-nowrap ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        <div>
                          <p className="font-medium">{log.userName}</p>
                          {log.userEmail && (
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">
                        {log.details || '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground font-mono">
                        {log.ipAddress || '—'}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "d 'de' MMM, yyyy HH:mm", { locale: es })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {logsTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {logsPage} de {logsTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(logsPage - 1)}
              disabled={logsPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(logsPage + 1)}
              disabled={logsPage >= logsTotalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
