import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login attempt:", {
      username,
      usernameLength: username?.length,
      password: password ? "***" : "empty",
      passwordLength: password?.length,
    })

    // Username: admin
    // Password: admin123
    if (username === "admin" && password === "admin123") {
      console.log("[v0] Admin login successful")
      return NextResponse.json({
        success: true,
        user: {
          username: "admin",
          first_name: "Administrador",
          last_name: "Sistema",
          role: "admin",
          has_infinite_credits: true,
        },
      })
    }

    console.log("[v0] Admin login failed - incorrect credentials")
    return NextResponse.json({ success: false, error: "Credenciales incorrectas" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}
