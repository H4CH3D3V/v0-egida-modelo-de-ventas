import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Infinity } from "lucide-react"
import Link from "next/link"

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Planes y Facturación</h1>
          <p className="text-muted-foreground">Elige el plan que mejor se adapte a tus necesidades</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Básico</CardTitle>
              <CardDescription>Perfecto para empezar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>1,000 créditos mensuales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Acceso al chat con Yulia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Generación de imágenes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Análisis de documentos</span>
                </li>
              </ul>
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Unlimited Plan */}
          <Card className="border-[#00BFFF] border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Plan Ilimitado</CardTitle>
                <Infinity className="h-5 w-5 text-[#00BFFF]" />
              </div>
              <CardDescription>Para uso profesional intensivo</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$1,999</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span className="font-semibold">Créditos ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Todo del plan básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Generación de videos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Búsqueda web ilimitada</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Soporte prioritario</span>
                </li>
              </ul>
              <Button className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Planes Empresariales</CardTitle>
            <CardDescription>Soluciones personalizadas para tu empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              ¿Necesitas un plan personalizado para tu empresa? Contáctanos para obtener una cotización adaptada a tus
              necesidades.
            </p>
            <Link href="/">
              <Button variant="outline">Contactar Ventas</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href={profile.company_id ? `/${profile.company_id}/chat` : "/chat"}>
            <Button variant="outline">Volver al Chat</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
