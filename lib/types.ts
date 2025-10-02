export interface Profile {
  id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  age: number | null
  city: string | null
  role: "user" | "admin" | "super_admin"
  company_id: string | null
  credits: number
  has_infinite_credits: boolean
  password_changed: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  company_id: string | null
  title: string
  mode: "normal" | "confidente" | "practice_call"
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant" | "system"
  content: string
  metadata: Record<string, any>
  created_at: string
}

export interface Lead {
  id: string
  company_id: string
  assigned_to: string | null
  name: string
  phone: string | null
  email: string | null
  city: string | null
  lada: string | null
  status: "sin_contactar" | "primera_llamada" | "whatsapp_enviado" | "cliente_zoom" | "cliente_cerrado"
  zoom_date: string | null
  closed_date: string | null
  notes: string | null
  metadata: Record<string, any>
  assigned_at: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  company_id: string
  name: string
  phone: string | null
  email: string | null
  city: string | null
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}
