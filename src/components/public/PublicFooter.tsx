'use client'

import { Github, Twitter, Rss, Heart, Loader2 } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { Separator } from '@/components/ui/separator'

export function PublicFooter() {
  const categories = usePublicStore((s) => s.categories)
  const tags = usePublicStore((s) => s.tags)

  const settings = usePublicStore((s) => s.settings || {})
  const isSettingsLoading = Object.keys(settings).length === 0
  const siteName = settings.site_name || 'NewsPortal'
  const siteLogo = settings.site_logo

  const firstLetter = siteName.charAt(0)
  const restOfName = siteName.slice(1)

  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              {isSettingsLoading ? (
                <div className="flex h-8 items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-12 max-w-[200px] object-contain w-auto" />
              ) : (
                <>
                  <span
                    className="text-destructive"
                    style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 900 }}
                  >
                    {firstLetter}
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">{restOfName}</span>
                </>
              )}
            </div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tu fuente confiable de noticias de última hora, análisis en profundidad e historias de todo el mundo.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="sm:justify-self-end">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
              Categorías
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => usePublicStore.getState().selectCategory(cat.slug)}
                    className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          © {currentYear} {siteName}. Todos los derechos reservados.
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          Hecho con <Heart className="h-3 w-3 text-destructive" /> para el periodismo
        </p>
      </div>
    </footer>
  )
}
