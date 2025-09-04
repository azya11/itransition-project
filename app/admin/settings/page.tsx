import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Database, Shield, Bell } from "lucide-react"
import Link from "next/link"

export default async function AdminSettings() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure system preferences and policies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic system configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default User Role</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="user">User</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Public Template Creation</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="all">All Users</option>
                  <option value="verified">Verified Users Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="auto-approve" className="rounded" />
                <label htmlFor="auto-approve" className="text-sm">
                  Auto-approve public templates
                </label>
              </div>

              <Button className="w-full">Save General Settings</Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Security policies and privacy controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Timeout (minutes)</label>
                <input type="number" defaultValue="60" className="w-full p-2 border rounded-md" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password Requirements</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="min-length" className="rounded" defaultChecked />
                    <label htmlFor="min-length" className="text-sm">
                      Minimum 8 characters
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="special-chars" className="rounded" />
                    <label htmlFor="special-chars" className="text-sm">
                      Require special characters
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="two-factor" className="rounded" />
                <label htmlFor="two-factor" className="text-sm">
                  Enable two-factor authentication
                </label>
              </div>

              <Button className="w-full">Save Security Settings</Button>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>Database maintenance and optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Database Status</h4>
                <p className="text-sm text-blue-700">All systems operational</p>
                <p className="text-xs text-blue-600 mt-1">Last backup: 2 hours ago</p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  Run Database Cleanup
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Export System Data
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  View Database Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>System notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">New User Registrations</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Template Submissions</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">System Errors</label>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Weekly Reports</label>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <input type="email" placeholder="admin@example.com" className="w-full p-2 border rounded-md" />
              </div>

              <Button className="w-full">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
