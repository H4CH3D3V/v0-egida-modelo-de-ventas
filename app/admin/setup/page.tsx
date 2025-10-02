"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSetup = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Setup error:", error)
      setResults({ error: "Failed to initialize users" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inicializar Usuarios Pre-cargados</CardTitle>
          <CardDescription>
            Este proceso creará 21 usuarios (1 admin + 20 usuarios Newman) usando la API de autenticación de Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este proceso solo debe ejecutarse una vez durante la configuración inicial. Los usuarios que ya existan
              serán omitidos.
            </AlertDescription>
          </Alert>

          <Button onClick={handleSetup} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando usuarios...
              </>
            ) : (
              "Inicializar Usuarios"
            )}
          </Button>

          {results && (
            <div className="space-y-2">
              <h3 className="font-semibold">Resultados:</h3>
              {results.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{results.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {results.results?.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <span className="font-medium">{result.username}</span>
                        <span className="text-muted-foreground ml-2">({result.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === "created" && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Creado</span>
                          </>
                        )}
                        {result.status === "already_exists" && (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-600">Ya existe</span>
                          </>
                        )}
                        {result.status === "error" && (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">Error</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
