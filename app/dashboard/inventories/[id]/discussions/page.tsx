import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DiscussionThread } from "@/components/discussion-thread"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InventoryDiscussionsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get inventory
  const { data: inventory } = await supabase.from("inventories").select("*").eq("id", id).single()

  if (!inventory) {
    redirect("/dashboard/inventories")
  }

  // Check access
  if (!inventory.is_public && inventory.creator_id !== data.user.id) {
    redirect("/dashboard/inventories")
  }

  // Get discussions with user profiles
  const { data: discussions } = await supabase
    .from("discussions")
    .select(`
      *,
      profiles(full_name, email)
    `)
    .eq("inventory_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/dashboard/inventories/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Discussions</h2>
              <p className="text-lg text-muted-foreground">Collaborate on {inventory.name}</p>
            </div>
          </div>

          {/* Discussion Thread */}
          <DiscussionThread
            inventoryId={id}
            discussions={discussions || []}
            currentUserId={data.user.id}
            canParticipate={inventory.is_public || inventory.creator_id === data.user.id}
          />
        </div>
      </main>
    </div>
  )
}
