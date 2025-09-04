import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Package, MessageSquare, Heart } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { ItemsTable } from "@/components/items-table"
import { RealTimeIndicator } from "@/components/real-time-indicator"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InventoryDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get inventory with template and fields
  const { data: inventory } = await supabase
    .from("inventories")
    .select(`
      *,
      inventory_templates(
        name,
        description,
        template_fields(*)
      ),
      inventory_likes(count),
      discussions(count)
    `)
    .eq("id", id)
    .single()

  if (!inventory) {
    redirect("/dashboard/inventories")
  }

  // Check if user has access
  if (!inventory.is_public && inventory.creator_id !== data.user.id) {
    redirect("/dashboard/inventories")
  }

  // Get inventory items
  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("inventory_id", id)
    .order("created_at", { ascending: false })

  const templateFields = inventory.inventory_templates?.template_fields || []
  const canEdit = inventory.creator_id === data.user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/inventories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventories
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-bold text-foreground">{inventory.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant={inventory.is_public ? "default" : "secondary"}>
                    {inventory.is_public ? "Public" : "Private"}
                  </Badge>
                  {inventory.custom_id && <Badge variant="outline">ID: {inventory.custom_id}</Badge>}
                  <RealTimeIndicator inventoryId={id} currentUserId={data.user.id} />
                </div>
              </div>
              <p className="text-lg text-muted-foreground">{inventory.description || "No description provided"}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Template: {inventory.inventory_templates?.name}</span>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{items?.length || 0} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{inventory.likes_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{inventory.discussions?.[0]?.count || 0} discussions</span>
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/inventories/${id}/items/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
                <Link href={`/dashboard/inventories/${id}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Tags */}
          {inventory.tags && inventory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {inventory.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Items Section */}
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Inventory Items</CardTitle>
                      <CardDescription>Manage items in this inventory</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search items..." className="pl-10 w-64" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {items && items.length > 0 ? (
                    <ItemsTable items={items} templateFields={templateFields} canEdit={canEdit} inventoryId={id} />
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                      <p className="text-muted-foreground mb-6">Start adding items to your inventory</p>
                      {canEdit && (
                        <Link href={`/dashboard/inventories/${id}/items/create`}>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Item
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Template Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Template Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{inventory.inventory_templates?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inventory.inventory_templates?.description || "No description"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Custom Fields ({templateFields.length})</p>
                      {templateFields.length > 0 ? (
                        <div className="space-y-1">
                          {templateFields.slice(0, 3).map((field: any) => (
                            <div key={field.id} className="text-xs text-muted-foreground">
                              • {field.field_name} ({field.field_type})
                            </div>
                          ))}
                          {templateFields.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{templateFields.length - 3} more fields
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No custom fields</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/dashboard/inventories/${id}/discussions`}>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Discussions
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Export Items
                  </Button>
                  {canEdit && (
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Inventory
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
