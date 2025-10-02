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

    const { companySlug, mode } = await req.json()

    // Get company ID if provided
    let companyId = null
    if (companySlug) {
      const { data: company } = await supabase.from("companies").select("id").eq("slug", companySlug).single()

      if (company) {
        companyId = company.id
      }
    }

    // Create new chat
    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        company_id: companyId,
        title: "Nuevo Chat",
        mode: mode || "normal",
        is_encrypted: mode === "confidente",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create chat error:", error)
      return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error("[v0] Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
