import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function generateUsername(firstName: string, lastName: string): string {
  const firstPart = firstName.substring(0, 3).toUpperCase()
  const lastPart = lastName.substring(0, 3).toUpperCase()
  const random = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0")
  return `${firstPart}${lastPart}${random}`
}

function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { firstName, lastName, phone, age, city, company } = await req.json()

    // Generate username and temporary password
    const username = generateUsername(firstName, lastName)
    const temporaryPassword = generateTemporaryPassword()
    const email = `${username.toLowerCase()}@egida-temp.com`

    // Get company ID
    let companyId = null
    if (company) {
      const { data: companyData } = await supabase.from("companies").select("id").eq("slug", company).single()

      if (companyData) {
        companyId = companyData.id
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        username,
        first_name: firstName,
        last_name: lastName,
        phone,
        age: Number.parseInt(age),
        city,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Update profile with company and credits
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        company_id: companyId,
        credits: 100,
        password_changed: false,
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("[v0] Profile update error:", profileError)
    }

    // Send Telegram notification
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/telegram/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_user",
        userId: authData.user.id,
        data: {
          username,
          name: `${firstName} ${lastName}`,
          phone,
          age,
          city,
          temporaryPassword,
        },
      }),
    })

    return NextResponse.json({
      id: authData.user.id,
      username,
      temporaryPassword,
      email,
    })
  } catch (error) {
    console.error("[v0] Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
