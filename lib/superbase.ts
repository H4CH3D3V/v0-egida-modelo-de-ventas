import { createClient } from '@supabase/supabase-js'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente público (para frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Cliente admin (para server actions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tipos de base de datos
export type Profile = {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  age: number | null
  city: string | null
  role: 'user' | 'admin' | 'super_admin'
  company_id: string | null
  credits: number
  has_infinite_credits: boolean
  password_changed: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type Company = {
  id: string
  name: string
  size: string
  email: string
  phone: string
  industry: string
  created_at: string
}

export type Lead = {
  id: string
  name: string
  phone: string
  email: string | null
  city: string | null
  status: 'cold' | 'contacted' | 'first_call' | 'whatsapp_sent' | 'zoom_scheduled' | 'closed'
  assigned_to: string | null
  assigned_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Chat = {
  id: string
  user_id: string
  title: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

// Helper functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

export async function getUserByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
  
  return data
}

export async function checkCredits(userId: string): Promise<number> {
  const profile = await getProfile(userId)
  if (!profile) return 0
  if (profile.has_infinite_credits) return Infinity
  return profile.credits
}

export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  const profile = await getProfile(userId)
  if (!profile) return false
  if (profile.has_infinite_credits) return true
  
  if (profile.credits < amount) return false
  
  const { error } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - amount })
    .eq('id', userId)
  
  return !error
}
