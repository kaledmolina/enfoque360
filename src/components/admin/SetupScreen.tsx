'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Loader2, Sparkles, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface SetupScreenProps {
  onSetupComplete: () => void
}

export default function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Por favor, rellena todos los campos.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('¡Administrador creado con éxito!')
        onSetupComplete()
      } else {
        toast.error(data.error || 'Error al completar la configuración.')
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Background glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur-xl text-white shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Shield className="h-7 w-7 text-indigo-400 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
              Configuración Inicial <Sparkles className="h-5 w-5 text-yellow-400 inline" />
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Crea la primera cuenta de administrador para empezar a gestionar tu portal de noticias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="setup-name" className="text-slate-300">Nombre Completo</Label>
                <Input
                  id="setup-name"
                  placeholder="Ej. Carlos Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="setup-email" className="text-slate-300">Correo Electrónico</Label>
                <Input
                  id="setup-email"
                  type="email"
                  placeholder="admin@newsportal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="setup-password" className="text-slate-300">Contraseña</Label>
                <Input
                  id="setup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="setup-confirm" className="text-slate-300">Confirmar Contraseña</Label>
                <Input
                  id="setup-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-6 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando administrador...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Registrar Administrador
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
