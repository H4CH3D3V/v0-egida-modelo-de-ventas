import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

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

    // Get user profile to check credits
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check credits (1 credit for file upload)
    if (!profile.has_infinite_credits && profile.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Determine media type
    let mediaType = file.type
    if (!mediaType) {
      if (file.name.endsWith(".txt")) mediaType = "text/plain"
      else if (file.name.endsWith(".pdf")) mediaType = "application/pdf"
      else if (file.name.match(/\.(jpg|jpeg|png|gif)$/)) mediaType = "image/jpeg"
    }

    // Analyze file with Gemini
    const { text } = await generateText({
      model: "google/gemini-2.0-flash-exp",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza este documento y proporciona un resumen detallado de su contenido, extrayendo información clave.",
            },
            {
              type: "file",
              data: base64,
              mediaType,
            },
          ],
        },
      ],
    })

    // Deduct credit
    if (!profile.has_infinite_credits) {
      await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: 1,
        p_transaction_type: "file_upload",
        p_description: `File upload: ${file.name}`,
      })
    }

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("[v0] File upload error:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}
