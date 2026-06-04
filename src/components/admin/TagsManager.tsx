'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Tag as TagIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useAdminStore, type Tag } from '@/store/admin-store'
import { toast } from 'sonner'

export default function TagsManager() {
  const { tags, fetchTags, createTag, deleteTag } = useAdminStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagName, setTagName] = useState('')
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTags().finally(() => setIsLoading(false))
  }, [fetchTags])

  const openCreateDialog = () => {
    setTagName('')
    setError('')
    setCreateDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!tagName.trim()) {
      setError('El nombre de la etiqueta es obligatorio')
      return
    }
    setIsSaving(true)
    const result = await createTag(tagName.trim())
    if (result) {
      toast.success(`Etiqueta "${tagName.trim()}" creada`)
      setCreateDialogOpen(false)
    } else {
      toast.error('Error al crear la etiqueta (podría ya existir)')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    setIsSaving(true)
    const result = await deleteTag(deletingTag.id)
    if (result) {
      toast.success(`Etiqueta "${deletingTag.name}" eliminada`)
    } else {
      toast.error('Error al eliminar la etiqueta')
    }
    setIsSaving(false)
    setDeleteDialogOpen(false)
    setDeletingTag(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Etiquetas</h2>
          <p className="text-sm text-muted-foreground">
            {tags.length} {tags.length !== 1 ? 'etiquetas' : 'etiqueta'}
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Etiqueta
        </Button>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <TagIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tag.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tag.articleCount ?? 0} { (tag.articleCount ?? 0) !== 1 ? 'artículos' : 'artículo' }
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => {
                      setDeletingTag(tag)
                      setDeleteDialogOpen(true)
                    }}
                    title="Eliminar etiqueta"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {tags.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <TagIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>Aún no hay etiquetas.</p>
              <Button variant="outline" size="sm" onClick={openCreateDialog} className="mt-3">
                <Plus className="h-4 w-4 mr-1" />
                Crea tu primera etiqueta
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear Etiqueta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nombre de la etiqueta *</Label>
              <Input
                id="tag-name"
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value)
                  setError('')
                }}
                placeholder="ej. Tecnología"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Etiqueta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Etiqueta</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la etiqueta &quot;{deletingTag?.name}&quot;? Se quitará de todos los artículos que la utilicen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
