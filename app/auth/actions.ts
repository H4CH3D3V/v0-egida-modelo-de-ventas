"use server"

import { createClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function signUpAction(formData: {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
  phone: string
  age: string
  city: string
  company?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_APP_URL || ""}${formData.company ? `/${formData.company}/chat` : "/chat"}`,
      data: {
        username: formData.username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone.startsWith("+52") ? formData.phone : `+52${formData.phone}`,
        age: Number.parseInt(formData.age),
        city: formData.city,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Send Telegram notification for new user
  if (data.user) {
    try {
      const telegramToken = "8300695924:AAHxojhDnKHXAFFe2VuP0n4L_teR_6Arq7E"
      const telegramChatId = "8480186356"
      const message = `*Nuevo - USUARIO: ${formData.username} - Nombre: ${formData.firstName} ${formData.lastName}, Tel: ${formData.phone}, Edad: ${formData.age}, Ciudad: ${formData.city}.*`

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: "Markdown",
        }),
      })
    } catch {
      // Telegram notification failed silently
    }
  }

  return { success: true, userId: data.user?.id }
}

export async function signInAction(formData: {
  email: string
  password: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, userId: data.user?.id }
}

export async function signInWithUsernameAction(formData: {
  username: string
  password: string
}) {
  // Use service role to look up the user's email by username
  const cookieStore = await cookies()
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // ignore
          }
        },
      },
    }
  )

  // Look up user by username in auth.users metadata
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    return { error: "Error del servidor" }
  }

  const matchedUser = users.users.find(
    (u) => u.user_metadata?.username === formData.username
  )

  if (!matchedUser || !matchedUser.email) {
    return { error: "Usuario o contraseña incorrectos" }
  }

  // Now sign in with the found email
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: matchedUser.email,
    password: formData.password,
  })

  if (error) {
    return { error: "Usuario o contraseña incorrectos" }
  }

  return { success: true, userId: data.user?.id }
}
