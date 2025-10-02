"use server"

import { cookies } from "next/headers"

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"

export async function adminLogin(username: string, password: string) {
  console.log("[v0] Server: Admin login attempt", { username, passwordLength: password.length })

  // Simple credential check
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    console.log("[v0] Server: Credentials match!")

    // Set a secure cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return { success: true }
  }

  console.log("[v0] Server: Credentials do not match")
  return { success: false, error: "Usuario o contraseña incorrectos" }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}
