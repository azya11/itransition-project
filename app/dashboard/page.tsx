import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus, Users, BarChart3, Eye, Shield } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get recent templates and inventories
  const { data: recentTemplates } = await supabase
    .from("inventory_templates")
    .select("*")
    .eq("creator_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: recentInventories } = await supabase
    .from("inventories")
    .select("*, inventory_templates(name)")
    .eq("creator_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              Manage your inventories, templates, and collaborate with your team.
            </p>
            {profile?.role === "admin" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-medium">Administrator Access</p>
                  </div>
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                    >
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/dashboard/templates/create">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Plus className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Create Template</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Start with a new inventory template</p>
                  <Button className="w-full">Create</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/inventories/create">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Database className="h-12 w-12 text-accent mx-auto mb-2" />
                  <CardTitle className="text-lg">New Inventory</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Create inventory from template</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    Create
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/browse">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-warning mx-auto mb-2" />
                  <CardTitle className="text-lg">Browse Community</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Explore public templates</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    Browse
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 text-success mx-auto mb-2" />
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">View your inventory stats</p>
                <Button variant="outline" className="w-full bg-transparent">
                  View
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Inventories</CardTitle>
                  <Link href="/dashboard/inventories">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentInventories && recentInventories.length > 0 ? (
                  <div className="space-y-3">
                    {recentInventories.map((inventory) => (
                      <div key={inventory.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{inventory.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Template: {inventory.inventory_templates?.name}
                          </p>
                        </div>
                        <Link href={`/dashboard/inventories/${inventory.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inventories yet</p>
                    <p className="text-sm">Create your first inventory to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Templates</CardTitle>
                  <Link href="/dashboard/templates">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentTemplates && recentTemplates.length > 0 ? (
                  <div className="space-y-3">
                    {recentTemplates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.is_public ? "Public" : "Private"}</p>
                        </div>
                        <Link href={`/dashboard/templates/${template.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No templates yet</p>
                    <p className="text-sm">Create your first template to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
