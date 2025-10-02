import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { userId, credits, infiniteCredits } = await req.json()

    const { error } = await supabase
      .from("profiles")
      .update({
        credits: infiniteCredits ? 0 : credits,
        has_infinite_credits: infiniteCredits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
