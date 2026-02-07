"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const hasAccess = sessionStorage.getItem("admin_access")
    if (hasAccess) {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-foreground/60">Redirigiendo...</p>
    </div>
  )
}
