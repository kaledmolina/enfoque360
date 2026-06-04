'use client'

import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  name: string
  color: string
  slug?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  size?: 'sm' | 'md'
}

export function CategoryBadge({
  name,
  color,
  slug,
  onClick,
  className,
  size = 'sm',
}: CategoryBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-sm font-semibold uppercase tracking-wider transition-all duration-200',
        'hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        borderLeft: `3px solid ${color}`,
      }}
      aria-label={`Filter by ${name}`}
    >
      {name}
    </button>
  )
}
