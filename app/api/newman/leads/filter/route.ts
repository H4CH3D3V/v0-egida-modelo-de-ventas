import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name")
    const city = searchParams.get("city")
    const status = searchParams.get("status")
    const dateSort = searchParams.get("dateSort")

    let query = supabase.from("leads").select("*").eq("assigned_to", user.id)

    if (name) {
      query = query.ilike("name", `%${name}%`)
    }

    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (dateSort === "newest") {
      query = query.order("assigned_at", { ascending: false })
    } else if (dateSort === "oldest") {
      query = query.order("assigned_at", { ascending: true })
    }

    const { data: leads, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to filter leads" }, { status: 500 })
    }

    return NextResponse.json(leads)
  } catch (error) {
    console.error("[v0] Filter leads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
