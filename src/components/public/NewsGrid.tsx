'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, SlidersHorizontal } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { ArticleCard } from './ArticleCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

export function NewsGrid() {
  const articles = usePublicStore((s) => s.articles)
  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const currentPage = usePublicStore((s) => s.currentPage)
  const totalPages = usePublicStore((s) => s.totalPages)
  const isLoading = usePublicStore((s) => s.isLoading)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const fetchArticle = usePublicStore((s) => s.fetchArticle)
  const setPage = usePublicStore((s) => s.setPage)
  const searchQuery = usePublicStore((s) => s.searchQuery)
  const search = usePublicStore((s) => s.search)

  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest')

  const handleArticleClick = useCallback(
    (id: string) => {
      fetchArticle(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [fetchArticle]
  )

  const handleCategorySelect = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  // Sort articles locally
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'views') {
      return b.views - a.views
    }
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime()
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  const isHomepageCover = !selectedCategory && !searchQuery
  const gridArticles = isHomepageCover ? sortedArticles.slice(5) : sortedArticles

  // Loading skeletons
  if (isLoading && articles.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category filters skeleton */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-sm" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No se encontraron artículos</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedCategory || searchQuery
            ? 'Ningún artículo coincide con los filtros.'
            : 'Comienza publicando tu primer artículo.'}
        </p>
        {(selectedCategory || searchQuery) && (
          <button
            onClick={() => {
              handleCategorySelect(null)
              search('')
            }}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Limpiar todos los filtros
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Filter Tabs (Flat Editorial Style) */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap border-b border-border/40 font-heading">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[2px] ${
              selectedCategory === null
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[2px] ${
                selectedCategory === cat.slug
                  ? 'text-foreground font-black'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              style={
                selectedCategory === cat.slug
                  ? { borderBottomColor: cat.color, color: cat.color }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Search status banner */}
      {searchQuery && (
        <div className="mb-8 flex items-center justify-between border-l-4 border-primary bg-secondary/30 px-5 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-sans">Mostrando resultados de búsqueda para:</span>
            <span className="font-extrabold text-foreground font-heading">"{searchQuery}"</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => search('')}
            className="h-8 rounded-none text-xs text-primary hover:bg-primary/5 transition-colors font-bold uppercase tracking-wider"
          >
            Limpiar Búsqueda
          </Button>
        </div>
      )}

      {/* Section header & sorting */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-foreground font-heading whitespace-nowrap">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Últimas'
              : isHomepageCover
              ? 'Más noticias'
              : 'Últimas Historias'}
          </h2>
          <div className="h-[2px] w-full bg-primary/20" />
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-heading">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Ordenar:</span>
          <div className="inline-flex bg-secondary p-0.5 border border-border/20">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1 text-xs font-bold transition-all duration-200 ${
                sortBy === 'latest'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recientes
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`px-3 py-1 text-xs font-bold transition-all duration-200 ${
                sortBy === 'views'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Populares
            </button>
          </div>
        </div>
      </div>

      {/* Article Grid and Sidebar Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: News Grid (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {gridArticles.map((article) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => handleArticleClick(article.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="pt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setPage(currentPage - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    aria-disabled={currentPage <= 1}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1
                  const isFirst = page === 1
                  const isLast = page === totalPages
                  const isNearCurrent = Math.abs(page - currentPage) <= 1
                  const showEllipsisBefore = !isFirst && page === currentPage - 2
                  const showEllipsisAfter = !isLast && page === currentPage + 2

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  if (!isFirst && !isLast && !isNearCurrent && !showEllipsisBefore && !showEllipsisAfter) {
                    return null
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(page)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setPage(currentPage + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                    }}
                    aria-disabled={currentPage >= totalPages}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>

        {/* Right Column: Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Top Trends (Popular Articles) */}
          <div className="border-t-[2px] border-primary pt-4">
            <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-foreground font-heading">
              Artículos Populares
            </h3>
            
            <div className="divide-y divide-border/20">
              {[...articles]
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((art, idx) => (
                  <div
                    key={art.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0 group cursor-pointer"
                    onClick={() => handleArticleClick(art.id)}
                  >
                    <span className="text-3xl font-black font-heading text-primary/20 transition-colors group-hover:text-primary/40 leading-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1">
                      {art.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: art.category.color }}>
                          {art.category.name}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary font-heading line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground block">
                        {art.views} visitas
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
