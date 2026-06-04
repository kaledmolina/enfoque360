'use client'

import React, { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Loader2,
  ImageOff,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAdminStore, type Article } from '@/store/admin-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ArticleEditor from './ArticleEditor'

interface ArticleManagerProps {
  isAdmin: boolean
  userId: string
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

export default function ArticleManager({ isAdmin, userId }: ArticleManagerProps) {
  const {
    articles,
    isLoadingArticles,
    fetchArticles,
    deleteArticle,
    articleStatusFilter,
    articleSearchQuery,
    setArticleStatusFilter,
    setArticleSearchQuery,
  } = useAdminStore()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  // Filter articles for non-admin (own only)
  const displayedArticles = isAdmin
    ? articles
    : articles.filter((a) => a.authorId === userId)

  const filteredArticles = displayedArticles.filter((article) => {
    const matchesStatus =
      !articleStatusFilter ||
      articleStatusFilter === 'ALL' ||
      article.status === articleStatusFilter
    const matchesSearch =
      !articleSearchQuery ||
      article.title.toLowerCase().includes(articleSearchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleCreate = () => {
    setEditingArticle(null)
    setEditorOpen(true)
  }

  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setEditorOpen(true)
  }

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return
    setIsDeleting(true)
    await deleteArticle(articleToDelete.id)
    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setArticleToDelete(null)
  }

  const handleEditorClose = (changed?: boolean) => {
    setEditorOpen(false)
    setEditingArticle(null)
    if (changed) {
      fetchArticles()
    }
  }

  if (editorOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleEditorClose()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a la lista
          </Button>
          <h2 className="text-xl font-bold">
            {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <ArticleEditor
              article={editingArticle}
              onClose={handleEditorClose}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Artículos</h2>
          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} {filteredArticles.length !== 1 ? 'artículos encontrados' : 'artículo encontrado'}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                value={articleSearchQuery}
                onChange={(e) => setArticleSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={articleStatusFilter} onValueChange={setArticleStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Estados</SelectItem>
                <SelectItem value="DRAFT">Borradores</SelectItem>
                <SelectItem value="PENDING_REVIEW">En Revisión</SelectItem>
                <SelectItem value="PUBLISHED">Publicados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingArticles ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[40px]"></TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Autor</TableHead>
                    <TableHead className="hidden md:table-cell">Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Vistas</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Fecha</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="pl-6">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            <ImageOff className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate">{article.title}</p>
                          {article.isFeatured && (
                            <Badge variant="outline" className="text-[10px] mt-1">
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={article.author?.avatar || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {article.author?.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                            {article.author?.name || 'Desconocido'}
                          </span>
                        </div>
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
                          variant="outline"
                          className={`text-xs ${getStatusBadgeColor(article.status)}`}
                        >
                          {getStatusLabel(article.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3" />
                          {article.views}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(article.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(article)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(article)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredArticles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron artículos.</p>
                          <Button variant="outline" size="sm" onClick={handleCreate}>
                            <Plus className="h-4 w-4 mr-1" />
                            Crea tu primer artículo
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Artículo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{articleToDelete?.title}&quot;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Small placeholder icon component
function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
