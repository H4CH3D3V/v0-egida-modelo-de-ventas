import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              <CardTitle className="text-2xl">¡Cuenta Creada!</CardTitle>
            </div>
            <CardDescription>Verifica tu correo electrónico</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Te has registrado exitosamente. Por favor revisa tu correo electrónico para confirmar tu cuenta antes de
              iniciar sesión.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
