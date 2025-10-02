"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, ArrowLeft, Building2, Brain } from "lucide-react"
import Link from "next/link"
import { userLogin } from "@/lib/user-auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const company = searchParams.get("company") || "newman"
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const isNewman = company === "newman"
  const companyName = isNewman ? "Newman Bienes Raíces" : "Consejo Estoico"
  const companyIcon = isNewman ? Building2 : Brain

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    setLoading(true)

    console.log("[Login] Attempting login:", { username, company })

    try {
      const result = await userLogin(username.trim(), password, company)
      console.log("[Login] Result:", result)

      if (result.success) {
        console.log("[Login] ✅ Login successful")
        
        // Redirigir según necesite completar perfil
        if (result.needsProfile) {
          router.push("/complete-profile")
        } else {
          router.push("/chat")
        }
        router.refresh()
      } else {
        setError(result.error || "Credenciales incorrectas")
      }
    } catch (err) {
      console.error("[Login] Error:", err)
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <Card className="border-2 border-blue-100">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                {companyIcon === Building2 ? (
                  <Building2 className="h-10 w-10 text-white" />
                ) : (
                  <Brain className="h-10 w-10 text-white" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl">{companyName}</CardTitle>
            <CardDescription>
              {isNewman 
                ? "Ingresa con tus credenciales de asesor" 
                : "Accede a tu coaching estoico personalizado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isNewman ? "Ej: NWMNLJT61333" : "Tu usuario"}
                  required
                  autoComplete="username"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    términos y condiciones
                  </Link>{" "}
                  (incluyendo que la IA aprende de mis interacciones para un servicio especializado)
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={loading || !acceptTerms}
              >
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </Button>

              {/* Credenciales de ejemplo */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 text-xs">
                  <Shield className="h-3 w-3" />
                  <span>Credenciales de prueba</span>
                </div>
                <div className="font-mono text-sm space-y-1">
                  {isNewman ? (
                    <>
                      <p className="text-blue-700">Usuario: NWMNLJT61333</p>
                      <p className="text-blue-700">Contraseña: Newman2025!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-blue-700">Usuario: CESTXYZ123</p>
                      <p className="text-blue-700">Contraseña: Estoico2025!</p>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                ¿Necesitas ayuda?{" "}
                <Link href="/soporte" className="text-blue-600 hover:underline">
                  Contactar soporte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
