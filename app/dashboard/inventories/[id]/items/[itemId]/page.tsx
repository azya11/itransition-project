import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomFieldDisplay } from "@/components/custom-field-display"

interface PageProps {
  params: Promise<{ id: string; itemId: string }>
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id: inventoryId, itemId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get item with inventory and template info
  const { data: item } = await supabase
    .from("inventory_items")
    .select(`
      *,
      inventories(
        name,
        creator_id,
        is_public,
        inventory_templates(
          name,
          template_fields(*)
        )
      )
    `)
    .eq("id", itemId)
    .eq("inventory_id", inventoryId)
    .single()

  if (!item) {
    redirect(`/dashboard/inventories/${inventoryId}`)
  }

  // Check access
  const inventory = item.inventories
  if (!inventory.is_public && inventory.creator_id !== data.user.id) {
    redirect("/dashboard/inventories")
  }

  const templateFields = inventory.inventory_templates?.template_fields || []
  const canEdit = inventory.creator_id === data.user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/dashboard/inventories/${inventoryId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </Link>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-2">{item.name}</h2>
              <p className="text-lg text-muted-foreground">Item in {inventory.name}</p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/inventories/${inventoryId}/items/${itemId}/edit`}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-1">
                      {item.description || (
                        <span className="text-muted-foreground italic">No description provided</span>
                      )}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          <Package className="h-4 w-4 mr-2" />
                          {item.quantity}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields */}
              {templateFields.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Custom Fields</CardTitle>
                    <CardDescription>Template-specific information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {templateFields.map((field: any) => (
                        <CustomFieldDisplay
                          key={field.id}
                          field={field}
                          value={item.custom_fields?.[field.field_name]}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inventory</span>
                    <span className="font-medium">{inventory.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium">{inventory.inventory_templates?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{new Date(item.updated_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {canEdit && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/dashboard/inventories/${inventoryId}/items/${itemId}/edit`}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Item
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Duplicate Item
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
