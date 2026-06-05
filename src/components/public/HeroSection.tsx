'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, User } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Article } from '@/store/public-store'

interface HeroSectionProps {
  articles: Article[]
  onArticleClick: (id: string) => void
}

export function HeroSection({ articles, onArticleClick }: HeroSectionProps) {
  if (!articles || articles.length === 0) return null

  const leadArticle = articles[0]
  const secondaryArticles = articles.slice(1, 5) // Next 4 articles

  const formatPublishDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return format(new Date(dateStr), "d 'de' MMM, yyyy", { locale: es })
  }

  return (
    <div className="w-full bg-background border-b border-border/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. Lead Article (60% / 8 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 flex flex-col gap-4 group cursor-pointer"
            onClick={() => onArticleClick(leadArticle.id)}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              {leadArticle.coverImage ? (
                <Image
                  src={leadArticle.coverImage}
                  alt={leadArticle.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                  <span className="text-2xl font-black font-heading text-muted-foreground/30">colombiadebate</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {leadArticle.category && (
                <span 
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: leadArticle.category.color }}
                >
                  {leadArticle.category.name}
                </span>
              )}

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                {leadArticle.title}
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {leadArticle.excerpt}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                {leadArticle.author && (
                  <span className="font-semibold text-foreground/85">{leadArticle.author.name}</span>
                )}
                {leadArticle.author && leadArticle.publishedAt && <span className="text-muted-foreground/30">•</span>}
                {leadArticle.publishedAt && <span>{formatPublishDate(leadArticle.publishedAt)}</span>}
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{leadArticle.views} visitas</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Secondary Stack (40% / 4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/90 border-b border-border/30 pb-2">
              Destacados
            </h3>
            
            <div className="flex flex-col gap-5 divide-y divide-border/20">
              {secondaryArticles.map((art, index) => {
                const dateText = formatPublishDate(art.publishedAt)
                return (
                  <motion.div
                    key={art.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex gap-4 pt-4 first:pt-0 group cursor-pointer"
                    onClick={() => onArticleClick(art.id)}
                  >
                    {/* Secondary Thumbnail */}
                    <div className="relative aspect-[4/3] w-28 sm:w-32 flex-shrink-0 overflow-hidden bg-muted">
                      {art.coverImage ? (
                        <Image
                          src={art.coverImage}
                          alt={art.title}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                          sizes="150px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                          <span className="text-[10px] font-bold text-muted-foreground/30">Noticia</span>
                        </div>
                      )}
                    </div>

                    {/* Secondary Text */}
                    <div className="flex flex-col gap-1 justify-center">
                      {art.category && (
                        <span 
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: art.category.color }}
                        >
                          {art.category.name}
                        </span>
                      )}
                      
                      <h4 className="text-sm font-bold font-heading leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
                        {art.title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                        {dateText && <span>{dateText}</span>}
                        {dateText && <span className="text-muted-foreground/30">•</span>}
                        <div className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          <span>{art.views}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
