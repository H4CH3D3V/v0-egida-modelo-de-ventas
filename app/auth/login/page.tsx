"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const company = searchParams.get("company")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // First, get user by username to find their email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single()

      if (profileError || !profiles) {
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
        return
      }

      // Get email from auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profiles.id)

      if (userError || !userData.user?.email) {
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
        return
      }

      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password,
      })

      if (signInError) {
        setError("Usuario o contraseña incorrectos")
        setIsLoading(false)
        return
      }

      if (company === "newman") {
        router.push("/newman/chat")
      } else {
        router.push("/newman/chat")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              {company === "newman" ? "Newman Bienes Raíces" : "Égida Modelo de Ventas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="usuario"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    Acepto los términos y condiciones (incluyendo que la IA aprende de mis interacciones para un
                    servicio especializado como socio cognitivo cotidiano y profesional, de forma ofuscada para
                    privacidad)
                  </Label>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  href={`/auth/signup${company ? `?company=${company}` : ""}`}
                  className="underline underline-offset-4"
                >
                  Regístrate
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
