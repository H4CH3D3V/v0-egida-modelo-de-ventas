"use client"

import type React from "react"

import { useState } from "react"
import type { Profile, Company, Lead, Client } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Filter, Phone, MessageSquare, Video, CheckCircle, FileText, Plus } from "lucide-react"
import Link from "next/link"

interface NewmanCRMProps {
  profile: Profile
  company: Company
  initialLeads: Lead[]
  initialClients: Client[]
}

const STATUS_LABELS = {
  sin_contactar: "Sin Contactar",
  primera_llamada: "Primera Llamada",
  whatsapp_enviado: "WhatsApp Enviado",
  cliente_zoom: "Cliente para Zoom",
  cliente_cerrado: "Cliente Cerrado",
}

const STATUS_ICONS = {
  sin_contactar: Users,
  primera_llamada: Phone,
  whatsapp_enviado: MessageSquare,
  cliente_zoom: Video,
  cliente_cerrado: CheckCircle,
}

export default function NewmanCRM({ profile, company, initialLeads, initialClients }: NewmanCRMProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [showCallPracticeDialog, setShowCallPracticeDialog] = useState(false)
  const [filterForm, setFilterForm] = useState({
    name: "",
    city: "",
    status: "sin_contactar", // Updated default value to be a non-empty string
    dateSort: "",
  })
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    notes: "",
  })

  const handleGetLead = async () => {
    const response = await fetch("/api/newman/leads/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: company.id }),
    })

    if (response.ok) {
      const newLead = await response.json()
      setLeads([newLead, ...leads])
    }
  }

  const handleFilterLeads = async () => {
    const params = new URLSearchParams()
    if (filterForm.name) params.append("name", filterForm.name)
    if (filterForm.city) params.append("city", filterForm.city)
    if (filterForm.status) params.append("status", filterForm.status)
    if (filterForm.dateSort) params.append("dateSort", filterForm.dateSort)

    const response = await fetch(`/api/newman/leads/filter?${params.toString()}`)
    if (response.ok) {
      const filteredLeads = await response.json()
      setLeads(filteredLeads)
    }
    setShowFilterDialog(false)
  }

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    const response = await fetch("/api/newman/leads/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    })

    if (response.ok) {
      const updatedLead = await response.json()
      setLeads(leads.map((lead) => (lead.id === leadId ? updatedLead : lead)))
    }
  }

  const handleAddClient = async () => {
    const response = await fetch("/api/newman/clients/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...clientForm,
        companyId: company.id,
      }),
    })

    if (response.ok) {
      const newClient = await response.json()
      setClients([newClient, ...clients])
      setShowAddClientDialog(false)
      setClientForm({ name: "", phone: "", email: "", city: "", notes: "" })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/newman/clients/analyze-document", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      setClientForm({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        city: data.city || "",
        notes: data.notes || "",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM Newman Bienes Raíces</h1>
            <p className="text-muted-foreground">Gestiona tus leads y clientes</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCallPracticeDialog(true)} variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Practicar Llamada
            </Button>
            <Link href="/newman/chat">
              <Button variant="outline">Volver al Chat</Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Clientes Frío</TabsTrigger>
            <TabsTrigger value="clients">Cartera de Clientes</TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleGetLead} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Obtener Lead
              </Button>
              <Button onClick={() => setShowFilterDialog(true)} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar Leads
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => {
                const StatusIcon = STATUS_ICONS[lead.status]
                return (
                  <Card key={lead.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{lead.name}</CardTitle>
                          <CardDescription>
                            {lead.city && `${lead.city} ${lead.lada ? `(${lead.lada})` : ""}`}
                          </CardDescription>
                        </div>
                        <StatusIcon className="h-5 w-5 text-[#00BFFF]" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm">
                        {lead.phone && (
                          <p>
                            <span className="font-medium">Tel:</span> {lead.phone}
                          </p>
                        )}
                        {lead.email && (
                          <p>
                            <span className="font-medium">Email:</span> {lead.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs">Estado</Label>
                        <Select value={lead.status} onValueChange={(value) => handleUpdateLeadStatus(lead.id, value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {lead.notes && (
                        <div>
                          <Label className="text-xs">Notas</Label>
                          <p className="mt-1 text-sm text-muted-foreground">{lead.notes}</p>
                        </div>
                      )}

                      <Badge variant="outline" className="text-xs">
                        Asignado: {new Date(lead.assigned_at || lead.created_at).toLocaleDateString()}
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}

              {leads.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No tienes leads asignados</p>
                    <Button onClick={handleGetLead} className="mt-4 bg-[#00BFFF] hover:bg-[#00BFFF]/90">
                      Obtener tu primer lead
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Button onClick={() => setShowAddClientDialog(true)} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Button>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.city}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {client.phone && (
                      <p>
                        <span className="font-medium">Tel:</span> {client.phone}
                      </p>
                    )}
                    {client.email && (
                      <p>
                        <span className="font-medium">Email:</span> {client.email}
                      </p>
                    )}
                    {client.notes && <p className="text-muted-foreground">{client.notes}</p>}
                  </CardContent>
                </Card>
              ))}

              {clients.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No tienes clientes en tu cartera</p>
                    <Button
                      onClick={() => setShowAddClientDialog(true)}
                      className="mt-4 bg-[#00BFFF] hover:bg-[#00BFFF]/90"
                    >
                      Agregar tu primer cliente
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Leads</DialogTitle>
            <DialogDescription>Aplica filtros para encontrar leads específicos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={filterForm.name}
                onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })}
                placeholder="Buscar por nombre"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={filterForm.city}
                onChange={(e) => setFilterForm({ ...filterForm, city: e.target.value })}
                placeholder="Buscar por ciudad"
              />
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Select
                value={filterForm.status}
                onValueChange={(value) => setFilterForm({ ...filterForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_contactar">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Ordenar por Fecha</Label>
              <Select
                value={filterForm.dateSort}
                onValueChange={(value) => setFilterForm({ ...filterForm, dateSort: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más reciente</SelectItem>
                  <SelectItem value="oldest">Más antiguo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleFilterLeads} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Cliente</DialogTitle>
            <DialogDescription>Agrega un nuevo cliente a tu cartera o sube un documento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Subir Documento (txt/vcard/pdf/img)</Label>
              <Input type="file" accept=".txt,.vcf,.pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
              <p className="text-xs text-muted-foreground">
                La IA analizará el documento y llenará los campos automáticamente
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                placeholder="cliente@ejemplo.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={clientForm.city}
                onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                placeholder="Ciudad"
              />
            </div>
            <div className="grid gap-2">
              <Label>Notas</Label>
              <Textarea
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
            <Button onClick={handleAddClient} className="w-full">
              Agregar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Practice Dialog */}
      <Dialog open={showCallPracticeDialog} onOpenChange={setShowCallPracticeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Practicar Llamada</DialogTitle>
            <DialogDescription>Mejora tus habilidades de ventas con simulaciones de llamadas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">Esta función te permitirá practicar llamadas en diferentes escenarios:</p>
            <ul className="list-inside list-disc space-y-2 text-sm">
              <li>Yulia te llama y tú eres el cliente</li>
              <li>Tú llamas a Yulia (modo fácil)</li>
              <li>Tú llamas a Yulia (modo difícil con objeciones)</li>
            </ul>
            <Link href="/newman/call-practice">
              <Button className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90">Iniciar Práctica</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
