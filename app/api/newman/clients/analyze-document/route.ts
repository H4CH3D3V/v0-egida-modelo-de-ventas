import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const clientDataSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
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
      else if (file.name.endsWith(".vcf")) mediaType = "text/vcard"
      else if (file.name.endsWith(".pdf")) mediaType = "application/pdf"
    }

    // Use Gemini to analyze the document
    const { object } = await generateObject({
      model: "google/gemini-2.0-flash-exp",
      schema: clientDataSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extrae la siguiente información de este documento: nombre completo, teléfono, email, ciudad, y cualquier nota relevante. Si no encuentras algún dato, déjalo vacío.",
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

    return NextResponse.json(object)
  } catch (error) {
    console.error("[v0] Analyze document error:", error)
    return NextResponse.json({ error: "Failed to analyze document" }, { status: 500 })
  }
}
