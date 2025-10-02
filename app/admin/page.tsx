"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === "SilenceSecret33") {
      // Store admin session
      sessionStorage.setItem("admin_authenticated", "true")
      router.push("/admin/dashboard")
    } else {
      setError("Contraseña incorrecta")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#00BFFF]" />
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
          </div>
          <CardDescription>Acceso restringido - Ingresa la contraseña de seguridad</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña de Seguridad</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90">
              Acceder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
