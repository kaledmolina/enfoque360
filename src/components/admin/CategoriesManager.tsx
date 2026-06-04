'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { useAdminStore, type Category } from '@/store/admin-store'
import { toast } from 'sonner'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

export default function CategoriesManager() {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useAdminStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState('#6366f1')
  const [formOrder, setFormOrder] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchCategories().finally(() => setIsLoading(false))
  }, [fetchCategories])

  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormName('')
    setFormDescription('')
    setFormColor('#6366f1')
    setFormOrder(categories.length)
    setErrors({})
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormDescription(category.description || '')
    setFormColor(category.color)
    setFormOrder(category.order)
    setErrors({})
    setDialogOpen(true)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formName.trim()) newErrors.name = 'El nombre es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)

    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
          order: formOrder,
        })
        if (result) {
          toast.success('Categoría actualizada con éxito')
          setDialogOpen(false)
        } else {
          toast.error('Error al actualizar la categoría')
        }
      } else {
        const result = await createCategory({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
          order: formOrder,
        })
        if (result) {
          toast.success('Categoría creada con éxito')
          setDialogOpen(false)
        } else {
          toast.error('Error al crear la categoría')
        }
      }
    } catch {
      toast.error('Ha ocurrido un error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    setIsSaving(true)
    const result = await deleteCategory(deletingCategory.id)
    if (result) {
      toast.success(`Categoría "${deletingCategory.name}" eliminada`)
    } else {
      toast.error('Error al eliminar la categoría')
    }
    setIsSaving(false)
    setDeleteDialogOpen(false)
    setDeletingCategory(null)
  }

  const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Categorías</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} {categories.length !== 1 ? 'categorías' : 'categoría'}
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Categoría
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-6 w-6" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 w-[50px]">Color</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Enlace (Slug)</TableHead>
                    <TableHead className="hidden md:table-cell">Artículos</TableHead>
                    <TableHead className="hidden lg:table-cell">Orden</TableHead>
                    <TableHead className="pr-6 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="pl-6">
                        <div
                          className="h-6 w-6 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {category.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">
                        {category.slug}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {category.articleCount ?? 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {category.order}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(category)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingCategory(category)
                              setDeleteDialogOpen(true)
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Aún no hay categorías creadas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nombre *</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre de la categoría"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              {formName.trim() && (
                <p className="text-xs text-muted-foreground">
                  Slug: <code className="bg-muted px-1 rounded">{generateSlug(formName)}</code>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">Descripción</Label>
              <Textarea
                id="cat-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descripción opcional..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      formColor === color ? 'scale-110 border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormColor(color)}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-16 h-9 p-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-order">Orden de Visualización</Label>
              <Input
                id="cat-order"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;{deletingCategory?.name}&quot;? Los artículos de esta categoría perderán su asignación.
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
