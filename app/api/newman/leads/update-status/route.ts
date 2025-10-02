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

    const { leadId, status } = await req.json()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "cliente_cerrado") {
      updateData.closed_date = new Date().toISOString()
    }

    const { data: updatedLead, error } = await supabase
      .from("leads")
      .update(updateData)
      .eq("id", leadId)
      .eq("assigned_to", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("[v0] Update lead status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
