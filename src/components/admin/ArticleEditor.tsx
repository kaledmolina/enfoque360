'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, X, Save, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAdminStore, type Article } from '@/store/admin-store'
import { toast } from 'sonner'

// Dynamic import MDXEditor to avoid SSR issues
const MDXEditor = dynamic(
  () =>
    import('@mdxeditor/editor').then((mod) => ({
      default: mod.MDXEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 border rounded-md bg-muted">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Cargando editor...</span>
        </div>
      </div>
    ),
  }
)

// Import MDXEditor plugins dynamically to avoid SSR issues
let headingsPlugin: unknown = null
let listsPlugin: unknown = null
let quotePlugin: unknown = null
let thematicBreakPlugin: unknown = null
let markdownShortcutPlugin: unknown = null

if (typeof window !== 'undefined') {
  import('@mdxeditor/editor').then((mod) => {
    headingsPlugin = mod.headingsPlugin
    listsPlugin = mod.listsPlugin
    quotePlugin = mod.quotePlugin
    thematicBreakPlugin = mod.thematicBreakPlugin
    markdownShortcutPlugin = mod.markdownShortcutPlugin
  })
}

interface ArticleEditorProps {
  article: Article | null
  onClose: (changed?: boolean) => void
}

export default function ArticleEditor({ article, onClose }: ArticleEditorProps) {
  const { categories, tags, createArticle, updateArticle } = useAdminStore()

  const [title, setTitle] = useState(article?.title || '')
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [coverImage, setCoverImage] = useState(article?.coverImage || '')
  const [categoryId, setCategoryId] = useState(article?.categoryId || 'NONE')
  const [content, setContent] = useState(article?.content || '')
  const [status, setStatus] = useState(article?.status || 'DRAFT')
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured || false)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t) => t.name) || []
  )
  const [tagInput, setTagInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isNew = !article

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'El título es obligatorio'
    if (!content.trim()) newErrors.content = 'El contenido es obligatorio'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setCoverImage(data.url)
        toast.success('Imagen subida correctamente')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Error al subir la imagen')
      }
    } catch (err) {
      toast.error('Ocurrió un error al subir el archivo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim(),
        coverImage: coverImage.trim() || undefined,
        categoryId: categoryId && categoryId !== 'NONE' ? categoryId : undefined,
        tags: selectedTags,
        status,
        isFeatured,
      }

      if (isNew) {
        const result = await createArticle(data)
        if (result) {
          toast.success('Artículo creado correctamente')
          onClose(true)
        } else {
          toast.error('Error al crear el artículo')
        }
      } else {
        const result = await updateArticle(article.id, data)
        if (result) {
          toast.success('Artículo actualizado correctamente')
          onClose(true)
        } else {
          toast.error('Error al actualizar el artículo')
        }
      }
    } catch (error) {
      toast.error('Ha ocurrido un error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim()
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagName))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleSelectTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName])
    }
  }

  // Re-render editor plugins when window loads
  const [plugins, setPlugins] = useState<unknown[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@mdxeditor/editor').then((mod) => {
        setPlugins([
          mod.headingsPlugin(),
          mod.listsPlugin(),
          mod.quotePlugin(),
          mod.thematicBreakPlugin(),
          mod.markdownShortcutPlugin(),
        ])
      })
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          placeholder="Título del artículo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Excerpt & Cover Image */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="excerpt">Resumen / Extracto</Label>
          <Textarea
            id="excerpt"
            placeholder="Breve descripción del artículo..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="coverImage">Imagen de Portada</Label>
          <div className="flex gap-2">
            <Input
              id="coverImage"
              placeholder="https://example.com/imagen.jpg o sube un archivo"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
            <div className="relative">
              <Button
                type="button"
                variant="secondary"
                disabled={isUploading}
                onClick={() => document.getElementById('cover-image-upload')?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Subir'
                )}
              </Button>
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          {coverImage && (
            <div className="mt-2">
              <img
                src={coverImage}
                alt="Vista previa de portada"
                className="h-24 w-full object-cover rounded-md border"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Category & Status & Featured */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Ninguna</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pendiente de Revisión</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Destacado</Label>
          <div className="flex items-center gap-3 pt-1">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeatured(!isFeatured)}
              className="text-muted-foreground"
            >
              {isFeatured ? <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" /> : <StarOff className="h-4 w-4 mr-1" />}
              {isFeatured ? 'Destacado' : 'No destacado'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Etiquetas</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Escribe una etiqueta y presiona Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          {tags.length > 0 && (
            <Select onValueChange={handleSelectTag}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Elegir etiqueta" />
              </SelectTrigger>
              <SelectContent>
                {tags
                  .filter((t) => !selectedTags.includes(t.name))
                  .map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Separator />

      {/* Content Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Contenido *</Label>
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content}</p>
          )}
        </div>
        <div className="min-h-[300px] border rounded-md overflow-hidden">
          {plugins.length > 0 && (
            <MDXEditor
              markdown={content}
              onChange={setContent}
              //@ts-expect-error - MDXEditor plugins typing
              plugins={plugins}
              contentEditableClassName="prose prose-sm max-w-none dark:prose-invert p-4 min-h-[300px] focus:outline-none"
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => onClose()}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isNew ? 'Crear Artículo' : 'Guardar Cambios'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

