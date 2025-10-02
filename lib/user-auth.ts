"use server"

import { cookies } from "next/headers"
import { supabaseAdmin, getUserByUsername } from "./supabase"

// Usuarios Newman pre-cargados
const NEWMAN_USERS = [
  { username: "NWMNLJT61333", email: "new001@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNMBF6887", email: "new002@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNZAS44133", email: "new003@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNVPW0477", email: "new004@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNRQF5507", email: "new005@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNODR42233", email: "new006@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNVNR0807", email: "new007@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNWEX37722", email: "new008@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNREQ84611", email: "new009@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNQTV8917", email: "new010@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNUFV6997", email: "new011@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNQFN29611", email: "new012@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNMGX1487", email: "new013@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNIGD45213", email: "new014@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNJGP5847", email: "new015@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNYJC17211", email: "new016@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNAEV67922", email: "new017@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNUWR95911", email: "new018@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNBJO68113", email: "new019@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNNIY3627", email: "new020@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNKPX8841", email: "new021@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNZQR3392", email: "new022@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNLWT5573", email: "new023@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNHDY9924", email: "new024@newman.com", password: "Newman2025!", role: "user" },
  { username: "NWMNFVB2215", email: "new025@newman.com", password: "Newman2025!", role: "user" },
]

// Usuario administrador
const ADMIN_USER = {
  username: "H4CH3D3V",
  email: "admin@newman.com",
  passwords: ["NewmanTech*", "NewmanTechHDevs"],
  role: "super_admin"
}

export async function userLogin(username: string, password: string, company: string) {
  console.log("[User Auth] Login attempt:", { username, company })
  
  const cleanUsername = username.trim()
  const cleanPassword = password.trim()

  try {
    // MÉTODO 1: Verificar administrador
    if (cleanUsername === ADMIN_USER.username) {
      if (ADMIN_USER.passwords.includes(cleanPassword)) {
        console.log("[User Auth] ✅ Admin login successful")
        
        // Buscar perfil en Supabase
        const profile = await getUserByUsername(cleanUsername)
        
        if (profile) {
          await setUserCookie(profile.id, cleanUsername, profile.role, company)
          return {
            success: true,
            userId: profile.id,
            username: cleanUsername,
            role: profile.role,
            needsProfile: !profile.first_name || !profile.last_name
          }
        }
        
        // Si no existe en DB, crear sesión temporal
        await setUserCookie("temp-admin", cleanUsername, ADMIN_USER.role, company)
        return {
          success: true,
          userId: "temp-admin",
          username: cleanUsername,
          role: ADMIN_USER.role,
          needsProfile: false
        }
      }
    }

    // MÉTODO 2: Verificar usuarios Newman
    const newmanUser = NEWMAN_USERS.find(u => u.username === cleanUsername)
    if (newmanUser && cleanPassword === newmanUser.password) {
      console.log("[User Auth] ✅ Newman user login successful")
      
      // Buscar o crear perfil en Supabase
      let profile = await getUserByUsername(cleanUsername)
      
      if (!profile) {
        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: newmanUser.email,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
            role: newmanUser.role
          }
        })
        
        if (authError || !authData.user) {
          console.error("[User Auth] Error creating user:", authError)
          return { success: false, error: "Error al crear usuario" }
        }
        
        // El trigger de la DB creará el perfil automáticamente
        profile = await getUserByUsername(cleanUsername)
      }
      
      if (profile) {
        await setUserCookie(profile.id, cleanUsername, profile.role, company)
        return {
          success: true,
          userId: profile.id,
          username: cleanUsername,
          role: profile.role,
          needsProfile: !profile.first_name || !profile.last_name
        }
      }
    }

    // MÉTODO 3: Verificar en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: `${cleanUsername}@newman.com`,
      password: cleanPassword
    })

    if (authData?.user && !authError) {
      const profile = await getUserByUsername(cleanUsername)
      
      if (profile) {
        console.log("[User Auth] ✅ Supabase auth successful")
        await setUserCookie(profile.id, cleanUsername, profile.role, company)
        return {
          success: true,
          userId: profile.id,
          username: cleanUsername,
          role: profile.role,
          needsProfile: !profile.first_name || !profile.last_name
        }
      }
    }

    // Login fallido
    console.log("[User Auth] ❌ All methods failed")
    return {
      success: false,
      error: "Usuario o contraseña incorrectos"
    }

  } catch (error) {
    console.error("[User Auth] Exception:", error)
    return {
      success: false,
      error: "Error al procesar login"
    }
  }
}

async function setUserCookie(userId: string, username: string, role: string, company: string) {
  const cookieStore = await cookies()
  const sessionData = JSON.stringify({
    userId,
    username,
    role,
    company,
    timestamp: Date.now()
  })
  
  cookieStore.set("user_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })
}

export async function userLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("user_session")
}

export async function checkUserAuth() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("user_session")
    
    if (!session?.value) {
      return { authenticated: false, userId: null, username: null, role: null, company: null }
    }
    
    const sessionData = JSON.parse(session.value)
    
    // Verificar expiración (7 días)
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000
    
    if (sessionAge > maxAge) {
      await userLogout()
      return { authenticated: false, userId: null, username: null, role: null, company: null }
    }
    
    return {
      authenticated: true,
      userId: sessionData.userId,
      username: sessionData.username,
      role: sessionData.role,
      company: sessionData.company
    }
  } catch (error) {
    console.error("[User Auth] Check auth error:", error)
    return { authenticated: false, userId: null, username: null, role: null, company: null }
  }
}
