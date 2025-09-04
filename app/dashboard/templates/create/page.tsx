"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

interface CustomField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
  field_options?: string[]
  is_required: boolean
  display_order: number
}

export default function CreateTemplatePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addCustomField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      field_name: "",
      field_type: "text",
      is_required: false,
      display_order: customFields.length,
    }
    setCustomFields([...customFields, newField])
  }

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields((fields) => fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const removeCustomField = (id: string) => {
    setCustomFields((fields) => fields.filter((field) => field.id !== id))
  }

  const updateSelectOptions = (fieldId: string, optionsText: string) => {
    const options = optionsText
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean)
    updateCustomField(fieldId, { field_options: options })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting template creation process")
    console.log("[v0] Form data:", { name, description, isPublic, customFields })

    const supabase = createClient()

    try {
      // Get current user
      console.log("[v0] Getting current user...")
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("[v0] User data:", user)
      if (!user) throw new Error("Not authenticated")

      // Validate custom fields
      console.log("[v0] Validating custom fields...")
      for (const field of customFields) {
        if (!field.field_name.trim()) {
          throw new Error("All custom fields must have a name")
        }
        if (field.field_type === "select" && (!field.field_options || field.field_options.length === 0)) {
          throw new Error(`Select field "${field.field_name}" must have at least one option`)
        }
      }

      // Create template
      console.log("[v0] Creating template...")
      const templateData = {
        name,
        description,
        is_public: isPublic,
        creator_id: user.id,
      }
      console.log("[v0] Template data to insert:", templateData)

      const { data: template, error: templateError } = await supabase
        .from("inventory_templates")
        .insert(templateData)
        .select()
        .single()

      console.log("[v0] Template creation result:", { template, templateError })
      if (templateError) throw templateError

      // Create custom fields
      if (customFields.length > 0) {
        console.log("[v0] Creating custom fields...")
        const fieldsToInsert = customFields.map((field) => ({
          template_id: template.id,
          field_name: field.field_name,
          field_type: field.field_type,
          field_options: field.field_options ? JSON.stringify(field.field_options) : null,
          is_required: field.is_required,
          display_order: field.display_order,
        }))

        console.log("[v0] Fields data to insert:", fieldsToInsert)

        const { error: fieldsError } = await supabase.from("template_fields").insert(fieldsToInsert)

        console.log("[v0] Fields creation result:", { fieldsError })
        if (fieldsError) throw fieldsError
      }

      console.log("[v0] Template creation successful, redirecting...")
      router.push("/dashboard/templates")
    } catch (error: unknown) {
      console.log("[v0] Error occurred:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/templates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Create Template</h2>
              <p className="text-lg text-muted-foreground">Design a reusable inventory template</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the basic details for your template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Office Supplies, Equipment Inventory"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this template is for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="public">Make this template public</Label>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custom Fields</CardTitle>
                    <CardDescription>Add custom fields to capture specific information</CardDescription>
                  </div>
                  <Button type="button" variant="outline" onClick={addCustomField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {customFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No custom fields yet</p>
                    <p className="text-sm">Add fields to capture specific data for your inventory items</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Field {index + 1}</Badge>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCustomField(field.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Field Name</Label>
                            <Input
                              placeholder="e.g., Serial Number, Category"
                              value={field.field_name}
                              onChange={(e) => updateCustomField(field.id, { field_name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Field Type</Label>
                            <Select
                              value={field.field_type}
                              onValueChange={(value: CustomField["field_type"]) =>
                                updateCustomField(field.id, { field_type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="boolean">Yes/No</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {field.field_type === "select" && (
                          <div className="grid gap-2">
                            <Label>Dropdown Options</Label>
                            <Input
                              placeholder="Option 1, Option 2, Option 3 (comma-separated)"
                              value={field.field_options?.join(", ") || ""}
                              onChange={(e) => updateSelectOptions(field.id, e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Enter options separated by commas</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.is_required}
                            onCheckedChange={(checked) => updateCustomField(field.id, { is_required: checked })}
                          />
                          <Label>Required field</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Creating..." : "Create Template"}
              </Button>
              <Link href="/dashboard/templates">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
