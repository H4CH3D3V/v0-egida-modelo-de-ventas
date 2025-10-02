import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import NewmanCRM from "@/components/newman/newman-crm"

export default async function NewmanCRMPage() {
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

  // Get Newman company
  const { data: company } = await supabase.from("companies").select("*").eq("slug", "newman").single()

  if (!company) {
    redirect("/newman/chat")
  }

  // Get user's assigned leads
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("assigned_to", user.id)
    .eq("company_id", company.id)
    .order("assigned_at", { ascending: false })

  // Get user's clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })

  return <NewmanCRM profile={profile} company={company} initialLeads={leads || []} initialClients={clients || []} />
}
