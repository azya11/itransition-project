import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Heart, Eye, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function InventoriesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's inventories with template info
  const { data: inventories } = await supabase
    .from("inventories")
    .select(`
      *,
      inventory_templates(name),
      inventory_likes(count),
      inventory_items(count)
    `)
    .eq("creator_id", data.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">My Inventories</h2>
              <p className="text-lg text-muted-foreground">Manage your inventory collections</p>
            </div>
            <Link href="/dashboard/inventories/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Inventory
              </Button>
            </Link>
          </div>

          {/* Inventories Grid */}
          {inventories && inventories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventories.map((inventory) => (
                <Card key={inventory.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{inventory.name}</CardTitle>
                        <CardDescription className="text-sm mb-2">
                          {inventory.description || "No description provided"}
                        </CardDescription>
                        <div className="text-xs text-muted-foreground">
                          Template: {inventory.inventory_templates?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{inventory.likes_count || 0}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={inventory.is_public ? "default" : "secondary"}>
                          {inventory.is_public ? "Public" : "Private"}
                        </Badge>
                        {inventory.custom_id && <Badge variant="outline">ID: {inventory.custom_id}</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{inventory.inventory_items?.[0]?.count || 0} items</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {inventory.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {inventory.tags && inventory.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{inventory.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/inventories/${inventory.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/inventories/${inventory.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No inventories yet</h3>
                <p className="text-muted-foreground mb-6">Create your first inventory from a template</p>
                <Link href="/dashboard/inventories/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
