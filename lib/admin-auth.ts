"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Credenciales hardcodeadas como fallback
const FALLBACK_CREDENTIALS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "H4CH3D3V", password: "NewmanTech*", role: "super_admin" },
  { username: "H4CH3D3V", password: "NewmanTechHDevs", role: "super_admin" }, // Alternativa
]

// Inicializar cliente de Supabase (asegúrate de tener estas variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey)
}

export async function adminLogin(username: string, password: string) {
  console.log("[v0] Server: Login attempt for:", username)
  
  // Limpiar espacios
  const cleanUsername = username.trim()
  const cleanPassword = password.trim()

  // ========================================
  // MÉTODO 1: Verificar credenciales hardcodeadas primero
  // ========================================
  const fallbackMatch = FALLBACK_CREDENTIALS.find(
    (cred) => cred.username === cleanUsername && cred.password === cleanPassword
  )

  if (fallbackMatch) {
    console.log("[v0] Server: ✅ Fallback credentials matched!")
    await setAuthCookie(cleanUsername, fallbackMatch.role)
    return { 
      success: true, 
      role: fallbackMatch.role,
      username: cleanUsername 
    }
  }

  // ========================================
  // MÉTODO 2: Verificar en Supabase (si está configurado)
  // ========================================
  if (supabase) {
    try {
      // Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${cleanUsername}@newman.com`, // Asume formato de email
        password: cleanPassword,
      })

      if (authData?.user && !authError) {
        // Obtener perfil del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", authData.user.id)
          .single()

        if (profile) {
          console.log("[v0] Server: ✅ Supabase auth successful!")
          await setAuthCookie(profile.username || cleanUsername, profile.role || "user")
          return { 
            success: true, 
            role: profile.role || "user",
            username: profile.username || cleanUsername
          }
        }
      }
    } catch (supabaseError) {
      console.log("[v0] Server: Supabase auth failed, continuing...")
    }
  }

  // ========================================
  // MÉTODO 3: Verificar usuarios Newman estándar
  // ========================================
  // Todos los usuarios Newman tienen: Newman2025!
  if (cleanUsername.startsWith("NWMN") && cleanPassword === "Newman2025!") {
    console.log("[v0] Server: ✅ Newman user credentials matched!")
    await setAuthCookie(cleanUsername, "user")
    return { 
      success: true, 
      role: "user",
      username: cleanUsername 
    }
  }

  // ========================================
  // LOGIN FALLIDO
  // ========================================
  console.log("[v0] Server: ❌ All authentication methods failed")
  return { 
    success: false, 
    error: "Usuario o contraseña incorrectos. Verifica tus credenciales." 
  }
}

// Función auxiliar para establecer la cookie de sesión
async function setAuthCookie(username: string, role: string) {
  const cookieStore = await cookies()
  
  // Crear token simple (en producción usa JWT)
  const sessionData = JSON.stringify({ username, role, timestamp: Date.now() })
  
  cookieStore.set("admin_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 horas
  })
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  
  // Si usas Supabase, también cerrar sesión ahí
  if (supabase) {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.log("[v0] Server: Supabase logout error:", error)
    }
  }
}

export async function checkAdminAuth() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    
    if (!session?.value) return { authenticated: false, role: null, username: null }
    
    // Parsear datos de sesión
    const sessionData = JSON.parse(session.value)
    
    // Verificar que la sesión no haya expirado (24 horas)
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas en ms
    
    if (sessionAge > maxAge) {
      await adminLogout()
      return { authenticated: false, role: null, username: null }
    }
    
    return { 
      authenticated: true, 
      role: sessionData.role,
      username: sessionData.username
    }
  } catch (error) {
    console.error("[v0] Server: Auth check error:", error)
    return { authenticated: false, role: null, username: null }
  }
}

// Función helper para verificar si un usuario es admin
export async function isAdmin() {
  const auth = await checkAdminAuth()
  return auth.authenticated && (auth.role === "admin" || auth.role === "super_admin")
}

// Función helper para verificar si un usuario es super admin
export async function isSuperAdmin() {
  const auth = await checkAdminAuth()
  return auth.authenticated && auth.role === "super_admin"
}
