"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"

interface Profile {
  id: string
  full_name: string | null
  email: string | null
}

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">InventoryPro</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/templates">
                <Button variant="ghost" size="sm">
                  Templates
                </Button>
              </Link>
              <Link href="/dashboard/inventories">
                <Button variant="ghost" size="sm">
                  Inventories
                </Button>
              </Link>
              <Link href="/dashboard/browse">
                <Button variant="ghost" size="sm">
                  Browse
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {loading ? "Loading..." : `Welcome, ${profile?.full_name || user?.email || "User"}`}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
