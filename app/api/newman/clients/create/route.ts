import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, email, city, notes, companyId } = await req.json()

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        company_id: companyId,
        name,
        phone,
        email,
        city,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("[v0] Create client error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
