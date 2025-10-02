import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "8300695924:AAHxojhDnKHXAFFe2VuP0n4L_teR_6Arq7E"
const TELEGRAM_CHAT_ID = "8480186356"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, data } = body

    let message = ""

    if (type === "new_user") {
      message = `*Nuevo Usuario Registrado*\n\nUsuario: ${data.username}\nNombre: ${data.name}\nTeléfono: ${data.phone}\nEdad: ${data.age}\nCiudad: ${data.city}`
    } else if (type === "progress_update") {
      message = `*Progreso - USUARIO: ${data.name}*\n\nINFORME: ${data.summary}\nAnálisis: ${data.analysis}\nDatos nuevos: ${data.newInfo}`
    } else if (type === "company_request") {
      message = `*Nueva Solicitud de Empresa*\n\nEmpresa: ${data.companyName}\nTamaño: ${data.size}\nCorreo: ${data.email}\nTeléfono: ${data.phone}\nGiro: ${data.industry}`
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send Telegram message")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Telegram notification error:", error)
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 })
  }
}
