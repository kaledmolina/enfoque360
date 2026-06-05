'use client'

import { useState, useCallback } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { Menu, Moon, Sun, Search, X, LogIn, Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { usePublicStore } from '@/store/public-store'

interface PublicHeaderProps {
  onLoginClick: () => void
}

export function PublicHeader({ onLoginClick }: PublicHeaderProps) {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')

  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const search = usePublicStore((s) => s.search)
  const setView = usePublicStore((s) => s.setView)
  
  const settings = usePublicStore((s) => s.settings || {})
  const isSettingsLoading = Object.keys(settings).length === 0
  const siteName = settings.site_name || 'NewsPortal'
  const siteLogo = settings.site_logo

  const firstLetter = siteName.charAt(0)
  const restOfName = siteName.slice(1)

  const handleDesktopSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const query = formData.get('search') as string
      search(query)
      setSearchOpen(false)
    },
    [search]
  )

  const handleMobileSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      search(mobileSearchQuery)
      setMobileSearchOpen(false)
      setMobileSearchQuery('')
    },
    [search, mobileSearchQuery]
  )

  const handleCategoryClick = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  // Split name for block representation
  const blockLetters = siteName.substring(0, 3).toUpperCase().padEnd(3, 'N').split('')

  return (
    <header className="w-full flex flex-col border-b border-border/80">
      {/* 1. BBC-style Top Black Bar */}
      <div className="w-full bg-black text-white py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          {/* Logo Blocks */}
          <button
            onClick={() => {
              setView('home')
              handleCategoryClick(null)
            }}
            className="flex items-center gap-1.5"
          >
            {blockLetters.map((char, idx) => (
              <div 
                key={idx} 
                className="bg-white text-black font-black text-xs w-6 h-6 flex items-center justify-center rounded-sm transition-transform hover:scale-110"
                style={{ fontFamily: 'monospace' }}
              >
                {char}
              </div>
            ))}
          </button>

          {/* Top Right Action Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoginClick}
            className="text-white hover:bg-white/10 hover:text-white h-7 text-xs font-semibold gap-1 rounded-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Iniciar Sesión</span>
          </Button>
        </div>
      </div>

      {/* 2. BBC-style Red Brand Bar */}
      <div className="w-full bg-primary text-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              setView('home')
              handleCategoryClick(null)
            }}
            className="text-left"
          >
            <h1 className="text-2xl font-black font-heading tracking-wide flex items-center gap-2">
              <span>NEWS</span>
              <span className="font-light text-white/80">{siteName.toUpperCase()}</span>
            </h1>
          </button>
        </div>
      </div>

      {/* 3. BBC-style Navigation Categories */}
      <div className="w-full bg-card border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center flex-wrap" aria-label="Main navigation">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-border/30 hover:bg-secondary/50 ${
                selectedCategory === null
                  ? 'text-primary bg-secondary/35 border-b-2 border-b-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Portada
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-r border-border/30 hover:bg-secondary/50 ${
                  selectedCategory === cat.slug
                    ? 'text-primary bg-secondary/35 border-b-2 border-b-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={selectedCategory === cat.slug ? { borderBottomColor: cat.color, color: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Desktop Search Toggle */}
          <div className="relative py-2 flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleDesktopSearch}
                  className="relative z-10"
                >
                  <Input
                    name="search"
                    type="search"
                    placeholder="Buscar..."
                    className="h-8 w-full rounded-sm border-border pl-3 pr-8 text-xs bg-card"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 text-muted-foreground hover:text-foreground ml-1"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left font-bold">Menú</SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <div className="px-4 pb-2">
                <form onSubmit={handleMobileSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar artículos..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="h-9 rounded-full border-border bg-secondary pl-3 pr-8 text-sm"
                  />
                  <Search className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </form>
              </div>

              <Separator className="mx-4" />

              {/* Mobile Categories */}
              <nav className="flex flex-col gap-1 px-4 pt-2" aria-label="Mobile navigation">
                <button
                  onClick={() => {
                    handleCategoryClick(null)
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  Todas las Noticias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryClick(cat.slug)
                    }}
                    className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    style={
                      selectedCategory === cat.slug
                        ? { backgroundColor: `${cat.color}15`, color: cat.color }
                        : undefined
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>

              <Separator className="mx-4 my-3" />

              {/* Login in mobile */}
              <div className="px-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onLoginClick}
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
