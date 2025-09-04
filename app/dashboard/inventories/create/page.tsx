"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

interface Template {
  id: string
  name: string
  description: string
}

interface TemplateField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
  field_options: string[] | null
  is_required: boolean
  display_order: number
}

export default function CreateInventoryPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [customId, setCustomId] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState("")
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplateFields(selectedTemplateId)
    } else {
      setTemplateFields([])
      setCustomFieldValues({})
    }
  }, [selectedTemplateId])

  const loadTemplates = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("inventory_templates")
      .select("id, name, description")
      .or("is_public.eq.true,creator_id.eq." + (await supabase.auth.getUser()).data.user?.id)
      .order("name")

    if (data) setTemplates(data)
  }

  const loadTemplateFields = async (templateId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("template_fields")
      .select("*")
      .eq("template_id", templateId)
      .order("display_order")

    if (data) {
      const fields = data.map((field) => ({
        ...field,
        field_options: field.field_options ? JSON.parse(field.field_options) : null,
      }))
      setTemplateFields(fields)

      // Initialize custom field values
      const initialValues: Record<string, any> = {}
      fields.forEach((field) => {
        initialValues[field.id] = field.field_type === "boolean" ? false : ""
      })
      setCustomFieldValues(initialValues)
    }
  }

  const updateCustomFieldValue = (fieldId: string, value: any) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const validateCustomFields = () => {
    for (const field of templateFields) {
      if (field.is_required) {
        const value = customFieldValues[field.id]
        if (field.field_type === "boolean") {
          // Boolean fields are always valid
          continue
        }
        if (!value || (typeof value === "string" && value.trim() === "")) {
          throw new Error(`${field.field_name} is required`)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate required fields
      validateCustomFields()

      // Prepare custom fields data
      const customFields: Record<string, any> = {}
      templateFields.forEach((field) => {
        customFields[field.field_name] = customFieldValues[field.id]
      })

      // Create inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from("inventories")
        .insert({
          template_id: selectedTemplateId,
          name,
          description,
          custom_id: customId || null,
          creator_id: user.id,
          is_public: isPublic,
          tags: tags
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        })
        .select()
        .single()

      if (inventoryError) throw inventoryError

      router.push(`/dashboard/inventories/${inventory.id}`)
    } catch (error: unknown) {
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
            <Link href="/dashboard/inventories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventories
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Create Inventory</h2>
              <p className="text-lg text-muted-foreground">Create a new inventory from a template</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Template Selection */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Select Template</CardTitle>
                <CardDescription>Choose a template to base your inventory on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground">{template.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            {selectedTemplateId && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Set up the basic details for your inventory</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Inventory Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Office Supplies Q1 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe this inventory..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customId">Custom ID (Optional)</Label>
                    <Input
                      id="customId"
                      placeholder="e.g., INV-2024-001"
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., office, supplies, quarterly (comma-separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="public">Make this inventory public</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Fields */}
            {templateFields.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Template Fields</CardTitle>
                  <CardDescription>Fill in the custom fields for this template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {templateFields.map((field) => (
                    <div key={field.id} className="grid gap-2">
                      <Label htmlFor={field.id} className="flex items-center gap-2">
                        {field.field_name}
                        {field.is_required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>

                      {field.field_type === "text" && (
                        <Input
                          id={field.id}
                          type="text"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => updateCustomFieldValue(field.id, e.target.value)}
                          required={field.is_required}
                        />
                      )}

                      {field.field_type === "number" && (
                        <Input
                          id={field.id}
                          type="number"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => updateCustomFieldValue(field.id, e.target.value)}
                          required={field.is_required}
                        />
                      )}

                      {field.field_type === "date" && (
                        <Input
                          id={field.id}
                          type="date"
                          value={customFieldValues[field.id] || ""}
                          onChange={(e) => updateCustomFieldValue(field.id, e.target.value)}
                          required={field.is_required}
                        />
                      )}

                      {field.field_type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={field.id}
                            checked={customFieldValues[field.id] || false}
                            onCheckedChange={(checked) => updateCustomFieldValue(field.id, checked)}
                          />
                          <Label htmlFor={field.id} className="text-sm text-muted-foreground">
                            {customFieldValues[field.id] ? "Yes" : "No"}
                          </Label>
                        </div>
                      )}

                      {field.field_type === "select" && field.field_options && (
                        <Select
                          value={customFieldValues[field.id] || ""}
                          onValueChange={(value) => updateCustomFieldValue(field.id, value)}
                          required={field.is_required}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.field_options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* Submit */}
            {selectedTemplateId && (
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={isLoading || !name.trim()}>
                  {isLoading ? "Creating..." : "Create Inventory"}
                </Button>
                <Link href="/dashboard/inventories">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
