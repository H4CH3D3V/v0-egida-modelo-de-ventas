"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building2, KeyRound } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

const COMPANY_SIZES = ["0-10", "10-20", "20-50", "50-100", "+100"]

const INDUSTRIES = [
  "Tarjetas de Crédito",
  "Seguros de vida",
  "Bienes Raíces",
  "Tecnología",
  "Consultoría",
  "Educación",
  "Salud",
  "Otro",
]

export default function HomePage() {
  const router = useRouter()
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showAdminCodeDialog, setShowAdminCodeDialog] = useState(false)
  const [adminCode, setAdminCode] = useState("")
  const [codeError, setCodeError] = useState("")

  const [companyForm, setCompanyForm] = useState({
    name: "",
    size: "",
    email: "",
    phone: "",
    industry: "",
    otherIndustry: "",
  })

  const handleAdminCodeSubmit = () => {
    if (adminCode === "N3wm4n4dm1") {
      // Set a session flag to allow access
      sessionStorage.setItem("admin_access", "true")
      router.push("/admin/dashboard")
    } else {
      setCodeError("Código incorrecto")
    }
  }

  const handleAddCompany = async () => {
    const industry = companyForm.industry === "Otro" ? companyForm.otherIndustry : companyForm.industry

    const message = `Hola! Tengo una empresa llamada ${companyForm.name} y quisiera conocer sus planes de empresa y los costos. Tenemos de ${companyForm.size} empleados, mi correo es ${companyForm.email}, el número oficial de mi empresa es ${companyForm.phone} y mi empresa se desenvuelve en giro de ${industry}.`

    const whatsappUrl = `https://wa.me/5215513826707?text=${encodeURIComponent(message)}`

    await fetch("/api/telegram/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "company_request",
        data: {
          companyName: companyForm.name,
          size: companyForm.size,
          email: companyForm.email,
          phone: companyForm.phone,
          industry,
        },
      }),
    })

    window.open(whatsappUrl, "_blank")
    setShowAddCompanyDialog(false)
  }

  const handleContact = () => {
    const message = "Hola! Me gustaría contactar con el creador de Égida Modelo de Ventas."
    const whatsappUrl = `https://wa.me/5215513826707?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    setShowContactDialog(false)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <div className="absolute top-6 right-6 z-20">
        <Button
          onClick={() => {
            setShowAdminCodeDialog(true)
            setAdminCode("")
            setCodeError("")
          }}
          variant="outline"
          className="border-black hover:bg-black hover:text-white"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Ingresar Código
        </Button>
      </div>

      <div className="absolute inset-0 z-0">
        <Image src="/yulia-avatar.png" alt="Yulia AI Assistant" fill className="object-cover opacity-20" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8 text-center">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-black md:text-6xl text-balance">
              Égida Modelo de Ventas
            </h1>
            <p className="text-xl text-foreground/80 text-balance">
              Selecciona tu empresa para acceder a tu coach IA personalizado
            </p>
          </div>

          {/* Company Selection Cards */}
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <Link href="/auth/login?company=newman" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-[#00BFFF]">
                <CardHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative h-32 w-full">
                      <Image src="/newman-logo.png" alt="Newman Bienes Raíces" fill className="object-contain" />
                    </div>
                  </div>
                  <CardTitle className="text-[#00BFFF] group-hover:text-[#00BFFF]/80">Newman Bienes Raíces</CardTitle>
                  <CardDescription className="text-base">(ASESORES INMOBILIARIOS)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white">
                    <Building2 className="mr-2 h-4 w-4" />
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Add Company */}
            <button onClick={() => setShowAddCompanyDialog(true)} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-black">
                <CardHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed border-black/20 group-hover:border-black/40 transition-colors">
                      <Plus className="h-12 w-12 text-black/60 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                  <CardTitle className="text-black group-hover:text-black/80">Agrega tu empresa</CardTitle>
                  <CardDescription className="text-base">a nuestro espacio</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-black hover:bg-black hover:text-white bg-transparent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Empresa
                  </Button>
                </CardContent>
              </Card>
            </button>
          </div>

          {/* Contact Creator Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowContactDialog(true)}
              className="border-[#00BFFF] text-[#00BFFF] hover:bg-[#00BFFF] hover:text-white"
            >
              Contactar con el creador
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showAdminCodeDialog} onOpenChange={setShowAdminCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acceso Administrativo</DialogTitle>
            <DialogDescription>Ingresa el código de acceso para continuar al panel de administración</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="adminCode">Código de Acceso</Label>
              <Input
                id="adminCode"
                type="password"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value)
                  setCodeError("")
                }}
                placeholder="Ingresa el código"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdminCodeSubmit()
                  }
                }}
              />
              {codeError && <p className="text-sm text-red-500">{codeError}</p>}
            </div>
            <Button onClick={handleAdminCodeSubmit} className="w-full bg-black hover:bg-black/90">
              Ingresar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={showAddCompanyDialog} onOpenChange={setShowAddCompanyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registra tu Empresa</DialogTitle>
            <DialogDescription>
              Completa el formulario y te contactaremos por WhatsApp con información sobre nuestros planes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nombre de la Empresa</Label>
              <Input
                id="companyName"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="Mi Empresa S.A."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companySize">Tamaño (Empleados)</Label>
              <Select
                value={companyForm.size}
                onValueChange={(value) => setCompanyForm({ ...companyForm, size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyEmail">Correo Electrónico</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                placeholder="contacto@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyPhone">Número Oficial</Label>
              <Input
                id="companyPhone"
                type="tel"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Giro Comercial</Label>
              <Select
                value={companyForm.industry}
                onValueChange={(value) => setCompanyForm({ ...companyForm, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {companyForm.industry === "Otro" && (
              <div className="grid gap-2">
                <Label htmlFor="otherIndustry">Especifica el Giro</Label>
                <Input
                  id="otherIndustry"
                  value={companyForm.otherIndustry}
                  onChange={(e) => setCompanyForm({ ...companyForm, otherIndustry: e.target.value })}
                  placeholder="Describe tu giro comercial"
                />
              </div>
            )}
            <Button onClick={handleAddCompany} className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90">
              Registrarse
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactar con el Creador</DialogTitle>
            <DialogDescription>
              Serás redirigido a WhatsApp para contactar directamente con el creador de Égida.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContact} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
              Abrir WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
