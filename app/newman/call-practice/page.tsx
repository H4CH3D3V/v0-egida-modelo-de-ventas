import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CallPracticePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?company=newman")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/newman/crm">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Práctica de Llamadas</h1>
            <p className="text-muted-foreground">Mejora tus habilidades con simulaciones realistas</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Phone className="mb-2 h-8 w-8 text-[#00BFFF]" />
              <CardTitle>Modo 1: Cliente</CardTitle>
              <CardDescription>Yulia te llama y tú eres el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Practica respondiendo objeciones y manejando diferentes tipos de clientes.
              </p>
              <Button className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="mb-2 h-8 w-8 text-[#00FF00]" />
              <CardTitle>Modo 2: Vendedor Fácil</CardTitle>
              <CardDescription>Tú llamas a Yulia (modo amigable)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Cliente receptivo y de buen ánimo. Perfecto para practicar tu pitch.
              </p>
              <Button className="w-full bg-[#00FF00] hover:bg-[#00FF00]/90 text-black" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="mb-2 h-8 w-8 text-destructive" />
              <CardTitle>Modo 3: Vendedor Difícil</CardTitle>
              <CardDescription>Tú llamas a Yulia (modo desafiante)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Cliente con objeciones y resistencia. Prepárate para el desafío.
              </p>
              <Button className="w-full" variant="destructive" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cómo Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">1. Selecciona un Modo</h3>
              <p className="text-sm text-muted-foreground">
                Elige el tipo de práctica que quieres realizar según tu nivel de experiencia.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">2. Activa tu Micrófono</h3>
              <p className="text-sm text-muted-foreground">
                La práctica usa voz en tiempo real. Asegúrate de tener un micrófono funcional.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">3. Practica y Recibe Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Al finalizar, Yulia te dará retroalimentación sobre tu desempeño y áreas de mejora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
