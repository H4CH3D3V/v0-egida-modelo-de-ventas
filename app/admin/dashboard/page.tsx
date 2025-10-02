"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Coins, Database, LogOut, Infinity, Upload, Users, FileSpreadsheet, TrendingUp } from "lucide-react"

const MEXICAN_CITIES = [
  "Aguascalientes",
  "Cancún",
  "Chihuahua",
  "Ciudad de México",
  "Guadalajara",
  "Mérida",
  "Monterrey",
  "Puebla",
  "Querétaro",
  "Tijuana",
]

interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  phone: string
  age: number
  city: string
  role: string
  credits: number
  has_infinite_credits: boolean
  company_id: string | null
}

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  city: string
  status: string
  assigned_to: string | null
  created_at: string
}

interface LeadStats {
  total: number
  available: number
  assigned: number
  contacted: number
  sold: number
  inProcess: number
  noContactable: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadStats, setLeadStats] = useState<LeadStats>({
    total: 0,
    available: 0,
    assigned: 0,
    contacted: 0,
    sold: 0,
    inProcess: 0,
    noContactable: 0,
  })

  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showCreditsDialog, setShowCreditsDialog] = useState(false)
  const [showUploadLeadsDialog, setShowUploadLeadsDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    city: "",
    company: "newman",
  })

  const [creditsAmount, setCreditsAmount] = useState("")
  const [infiniteCredits, setInfiniteCredits] = useState(false)
  const [leadsData, setLeadsData] = useState("")

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("admin_access")
    if (!hasAccess) {
      router.push("/")
    }

    fetchUsers()
    fetchLeads()
  }, [router])

  const fetchUsers = async () => {
    const response = await fetch("/api/admin/users")
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
  }

  const fetchLeads = async () => {
    const response = await fetch("/api/admin/leads")
    if (response.ok) {
      const data = await response.json()
      setLeads(data.leads)
      setLeadStats(data.stats)
    }
  }

  const handleCreateUser = async () => {
    const response = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    })

    if (response.ok) {
      const newUser = await response.json()
      await fetchUsers()
      setShowCreateUserDialog(false)
      setUserForm({ firstName: "", lastName: "", phone: "", age: "", city: "", company: "newman" })
      alert(`Usuario creado:\nUsuario: ${newUser.username}\nContraseña: ${newUser.temporaryPassword}`)
    }
  }

  const handleUpdateCredits = async () => {
    if (!selectedUser) return

    const response = await fetch("/api/admin/users/update-credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        credits: infiniteCredits ? 0 : Number.parseInt(creditsAmount),
        infiniteCredits,
      }),
    })

    if (response.ok) {
      await fetchUsers()
      setShowCreditsDialog(false)
      setSelectedUser(null)
      setCreditsAmount("")
      setInfiniteCredits(false)
    }
  }

  const handleUploadLeads = async () => {
    try {
      const leadsArray = leadsData.split("\n").filter((line) => line.trim())
      const parsedLeads = leadsArray.map((line) => {
        const [name, phone, email, city] = line.split(",").map((item) => item.trim())
        return { name, phone, email, city }
      })

      const response = await fetch("/api/admin/leads/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsedLeads }),
      })

      if (response.ok) {
        await fetchLeads()
        setShowUploadLeadsDialog(false)
        setLeadsData("")
        alert("Leads cargados exitosamente")
      }
    } catch (error) {
      alert("Error al cargar leads. Verifica el formato.")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access")
    router.push("/")
  }

  const handleBackupData = async () => {
    const response = await fetch("/api/admin/backup")
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `backup-${new Date().toISOString()}.json`
      a.click()
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestión completa del sistema Égida</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Disponibles</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Cerradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.sold}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="leads">Gestión de Leads</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateUserDialog(true)} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
              <Button onClick={handleBackupData} variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Backup de Datos
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios del Sistema</CardTitle>
                <CardDescription>Gestiona usuarios y sus créditos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.city}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.has_infinite_credits ? (
                            <div className="flex items-center gap-1">
                              <Infinity className="h-4 w-4" />
                              <span>Infinito</span>
                            </div>
                          ) : (
                            user.credits
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setCreditsAmount(user.credits.toString())
                              setInfiniteCredits(user.has_infinite_credits)
                              setShowCreditsDialog(true)
                            }}
                          >
                            <Coins className="mr-2 h-3 w-3" />
                            Créditos
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => setShowUploadLeadsDialog(true)} className="bg-[#00BFFF] hover:bg-[#00BFFF]/90">
                <Upload className="mr-2 h-4 w-4" />
                Cargar Leads
              </Button>
            </div>

            {/* Lead Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Por Estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Disponibles:</span>
                    <Badge variant="outline">{leadStats.available}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Asignados:</span>
                    <Badge variant="outline">{leadStats.assigned}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Contactados:</span>
                    <Badge variant="outline">{leadStats.contacted}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>En Proceso:</span>
                    <Badge variant="outline">{leadStats.inProcess}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendidos:</span>
                    <Badge className="bg-green-500">{leadStats.sold}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>No Contactables:</span>
                    <Badge variant="destructive">{leadStats.noContactable}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tasa de Conversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {leadStats.total > 0 ? ((leadStats.sold / leadStats.total) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Leads convertidos en ventas</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Base de Leads</CardTitle>
                <CardDescription>Gestión completa de prospectos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Asignado a</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.city}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lead.status === "sold" ? "default" : lead.status === "available" ? "outline" : "secondary"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.assigned_to || "-"}</TableCell>
                        <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>Se generará un usuario y contraseña automáticamente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div className="grid gap-2">
              <Label>Apellido</Label>
              <Input
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                placeholder="Apellido"
              />
            </div>
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
            <div className="grid gap-2">
              <Label>Edad</Label>
              <Input
                type="number"
                value={userForm.age}
                onChange={(e) => setUserForm({ ...userForm, age: e.target.value })}
                placeholder="25"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Select value={userForm.city} onValueChange={(value) => setUserForm({ ...userForm, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {MEXICAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateUser} className="w-full">
              Crear Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credits Dialog */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modificar Créditos</DialogTitle>
            <DialogDescription>
              Usuario: {selectedUser?.username} ({selectedUser?.first_name} {selectedUser?.last_name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Créditos Infinitos</Label>
              <Switch checked={infiniteCredits} onCheckedChange={setInfiniteCredits} />
            </div>
            {!infiniteCredits && (
              <div className="grid gap-2">
                <Label>Cantidad de Créditos</Label>
                <Input
                  type="number"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
            )}
            <Button onClick={handleUpdateCredits} className="w-full">
              Actualizar Créditos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Leads Dialog */}
      <Dialog open={showUploadLeadsDialog} onOpenChange={setShowUploadLeadsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cargar Base de Leads</DialogTitle>
            <DialogDescription>
              Ingresa los leads en formato CSV: Nombre, Teléfono, Email, Ciudad (uno por línea)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Datos de Leads</Label>
              <Textarea
                value={leadsData}
                onChange={(e) => setLeadsData(e.target.value)}
                placeholder="Juan Pérez, +52 55 1234 5678, juan@email.com, Ciudad de México\nMaría García, +52 33 8765 4321, maria@email.com, Guadalajara"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Formato: Nombre, Teléfono, Email, Ciudad</p>
              <p>Ejemplo: Juan Pérez, +52 55 1234 5678, juan@email.com, Ciudad de México</p>
            </div>
            <Button onClick={handleUploadLeads} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Cargar Leads
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
