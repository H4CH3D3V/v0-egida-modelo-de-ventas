import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Admin client with service role key for user creation
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Pre-loaded users data
const USERS = [
  // Admin
  {
    email: "admin@newman.com",
    password: "NewmanTech*",
    username: "H4CH3D3V",
    role: "admin",
    firstName: "Admin",
    lastName: "Newman",
  },
  // Newman users
  {
    email: "new001@newman.com",
    password: "Newman2025!",
    username: "NWMNLJT61333",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 001",
  },
  {
    email: "new002@newman.com",
    password: "Newman2025!",
    username: "NWMNMBF6887",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 002",
  },
  {
    email: "new003@newman.com",
    password: "Newman2025!",
    username: "NWMNZAS44133",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 003",
  },
  {
    email: "new004@newman.com",
    password: "Newman2025!",
    username: "NWMNVPW0477",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 004",
  },
  {
    email: "new005@newman.com",
    password: "Newman2025!",
    username: "NWMNRQF5507",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 005",
  },
  {
    email: "new006@newman.com",
    password: "Newman2025!",
    username: "NWMNODR42233",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 006",
  },
  {
    email: "new007@newman.com",
    password: "Newman2025!",
    username: "NWMNVNR0807",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 007",
  },
  {
    email: "new008@newman.com",
    password: "Newman2025!",
    username: "NWMNWEX37722",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 008",
  },
  {
    email: "new009@newman.com",
    password: "Newman2025!",
    username: "NWMNREQ84611",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 009",
  },
  {
    email: "new010@newman.com",
    password: "Newman2025!",
    username: "NWMNQTV8917",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 010",
  },
  {
    email: "new011@newman.com",
    password: "Newman2025!",
    username: "NWMNUFV6997",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 011",
  },
  {
    email: "new012@newman.com",
    password: "Newman2025!",
    username: "NWMNQFN29611",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 012",
  },
  {
    email: "new013@newman.com",
    password: "Newman2025!",
    username: "NWMNMGX1487",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 013",
  },
  {
    email: "new014@newman.com",
    password: "Newman2025!",
    username: "NWMNIGD45213",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 014",
  },
  {
    email: "new015@newman.com",
    password: "Newman2025!",
    username: "NWMNJGP5847",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 015",
  },
  {
    email: "new016@newman.com",
    password: "Newman2025!",
    username: "NWMNYJC17211",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 016",
  },
  {
    email: "new017@newman.com",
    password: "Newman2025!",
    username: "NWMNAEV67922",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 017",
  },
  {
    email: "new018@newman.com",
    password: "Newman2025!",
    username: "NWMNUWR95911",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 018",
  },
  {
    email: "new019@newman.com",
    password: "Newman2025!",
    username: "NWMNBJO68113",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 019",
  },
  {
    email: "new020@newman.com",
    password: "Newman2025!",
    username: "NWMNNIY3627",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 020",
  },
  // New 5 users
  {
    email: "new021@newman.com",
    password: "Newman2025!",
    username: "NWMNKPX8841",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 021",
  },
  {
    email: "new022@newman.com",
    password: "Newman2025!",
    username: "NWMNZQR3392",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 022",
  },
  {
    email: "new023@newman.com",
    password: "Newman2025!",
    username: "NWMNLWT5573",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 023",
  },
  {
    email: "new024@newman.com",
    password: "Newman2025!",
    username: "NWMNHDY9924",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 024",
  },
  {
    email: "new025@newman.com",
    password: "Newman2025!",
    username: "NWMNFVB2215",
    role: "user",
    firstName: "Usuario",
    lastName: "Newman 025",
  },
]

export async function POST(request: Request) {
  try {
    const results = []

    for (const user of USERS) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()

      const userExists = existingUser?.users.some((u) => u.email === user.email)

      if (userExists) {
        results.push({
          email: user.email,
          username: user.username,
          status: "already_exists",
        })
        continue
      }

      // Create user with Supabase Auth Admin API
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
          username: user.username,
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          password_changed: false,
          profile_completed: false, // Track if profile is completed
        },
      })

      if (createError) {
        results.push({
          email: user.email,
          username: user.username,
          status: "error",
          error: createError.message,
        })
        continue
      }

      // Send Telegram notification for new user
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_user",
          data: {
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        }),
      })

      results.push({
        email: user.email,
        username: user.username,
        status: "created",
        userId: newUser.user?.id,
      })
    }

    return NextResponse.json({
      message: "User initialization complete",
      results,
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Failed to initialize users" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "User setup endpoint. Use POST to initialize users.",
    totalUsers: USERS.length,
    users: USERS.map((u) => ({ email: u.email, username: u.username, role: u.role })),
  })
}
