import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ChatInterface from "@/components/chat/chat-interface"

export default async function NewmanChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?company=newman")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login?company=newman")
  }

  const profileCompleted = user.user_metadata?.profile_completed ?? true // Default to true for existing users
  const hasBasicInfo = profile.first_name && profile.last_name && profile.phone && profile.age && profile.city

  if (!profileCompleted || !hasBasicInfo) {
    redirect("/complete-profile")
  }

  const { data: chats } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return <ChatInterface profile={profile} initialChats={chats || []} companySlug="newman" />
}
