import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all data
    const { data: profiles } = await supabase.from("profiles").select("*")
    const { data: chats } = await supabase.from("chats").select("*")
    const { data: messages } = await supabase.from("messages").select("*")
    const { data: leads } = await supabase.from("leads").select("*")
    const { data: clients } = await supabase.from("clients").select("*")
    const { data: creditTransactions } = await supabase.from("credit_transactions").select("*")

    const backup = {
      timestamp: new Date().toISOString(),
      profiles,
      chats,
      messages,
      leads,
      clients,
      creditTransactions,
    }

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString()}.json"`,
      },
    })
  } catch (error) {
    console.error("[v0] Backup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
