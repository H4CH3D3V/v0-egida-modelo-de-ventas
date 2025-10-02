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

    const { companyId } = await req.json()

    // Get an unassigned lead
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("company_id", companyId)
      .is("assigned_to", null)
      .limit(1)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: "No available leads" }, { status: 404 })
    }

    // Assign lead to user
    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({
        assigned_to: user.id,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", lead.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to assign lead" }, { status: 500 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("[v0] Assign lead error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
