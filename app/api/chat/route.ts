import { createClient } from "@/lib/supabase/server"
import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, chatId, companySlug }: { messages: UIMessage[]; chatId?: string; companySlug?: string } =
      await req.json()

    // Get user profile to check credits
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check credits (1 credit per message)
    if (!profile.has_infinite_credits && profile.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    // Deduct credit for user message
    if (!profile.has_infinite_credits) {
      const { data, error } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: 1,
        p_transaction_type: "message",
        p_description: "User message",
      })

      if (error || !data) {
        return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 })
      }
    }

    // Get company for context
    let companyContext = ""
    if (companySlug) {
      const { data: company } = await supabase.from("companies").select("*").eq("slug", companySlug).single()

      if (company) {
        companyContext = `\n\nContexto de empresa: ${company.name} - ${company.description}`
      }
    }

    // System prompt based on company
    let systemPrompt = `Eres Yulia, una asistente de IA avanzada impulsada por Égida Modelo de Ventas. Eres un coach de ventas profesional, empático y dinámico. Tu objetivo es ayudar a los usuarios a mejorar sus habilidades de ventas y alcanzar sus metas profesionales.${companyContext}`

    if (companySlug === "newman") {
      systemPrompt = `Eres Yulia, coach de ventas especializada en bienes raíces para Newman Bienes Raíces. Utilizas el Prompt Maestro V3.0 para proporcionar coaching auténtico, dinámico y privado. Ayudas a los asesores inmobiliarios a gestionar leads, practicar llamadas y cerrar ventas.${companyContext}`
    }

    const prompt = convertToModelMessages([
      {
        id: "system",
        role: "system",
        parts: [{ type: "text", text: systemPrompt }],
      },
      ...messages,
    ])

    // Use Gemini model via AI Gateway
    const result = streamText({
      model: "google/gemini-2.0-flash-exp",
      messages: prompt,
      abortSignal: req.signal,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log("[v0] Chat aborted")
          return
        }

        // Deduct credit for assistant message
        if (!profile.has_infinite_credits) {
          await supabase.rpc("deduct_credits", {
            p_user_id: user.id,
            p_amount: 1,
            p_transaction_type: "message",
            p_description: "Assistant message",
          })
        }

        // Save messages to database if chatId provided
        if (chatId) {
          // Save user message
          const userMessage = messages[messages.length - 1]
          if (userMessage) {
            await supabase.from("messages").insert({
              chat_id: chatId,
              role: "user",
              content: userMessage.parts.find((p) => p.type === "text")?.text || "",
            })
          }
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
