import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ChatInterface from "@/components/chat/chat-interface"

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get user's chats
  const { data: chats } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return <ChatInterface profile={profile} initialChats={chats || []} />
}
