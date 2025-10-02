"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { adminLogin } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Client: Attempting login with:", { username, passwordLength: password.length })

    try {
      const result = await adminLogin(username.trim(), password)
      console.log("[v0] Client: Login result:", result)

      if (result.success) {
        console.log("[v0] Client: Login successful, redirecting...")
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        console.log("[v0] Client: Login failed:", result.error)
        setError(result.error || "Credenciales incorrectas")
      }
    } catch (err) {
      console.error("[v0] Client: Login error:", err)
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md space-y-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50">
                <Lock className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-white">Panel de Control</CardTitle>
            <CardDescription className="text-slate-300">Acceso exclusivo para administradores</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-slate-200">
                  Usuario
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  required
                  autoComplete="off"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-200">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="off"
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/30"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Ingresar al Panel"}
              </Button>

              <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>Credenciales de acceso</span>
                </div>
                <div className="font-mono text-sm space-y-1">
                  <p className="text-cyan-400">Usuario: admin</p>
                  <p className="text-cyan-400">Contraseña: admin123</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
