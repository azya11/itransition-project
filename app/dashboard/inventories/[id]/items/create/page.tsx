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
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { CustomFieldRenderer } from "@/components/custom-field-renderer"

interface PageProps {
  params: Promise<{ id: string }>
}

interface TemplateField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
  field_options: string[] | null
  is_required: boolean
}

export default function CreateItemPage({ params }: PageProps) {
  const [inventoryId, setInventoryId] = useState<string>("")
  const [inventory, setInventory] = useState<any>(null)
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [tags, setTags] = useState("")
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setInventoryId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (inventoryId) {
      loadInventoryAndFields()
    }
  }, [inventoryId])

  const loadInventoryAndFields = async () => {
    const supabase = createClient()

    // Get inventory with template fields
    const { data: inventoryData } = await supabase
      .from("inventories")
      .select(`
        *,
        inventory_templates(
          name,
          template_fields(*)
        )
      `)
      .eq("id", inventoryId)
      .single()

    if (inventoryData) {
      setInventory(inventoryData)
      const fields = inventoryData.inventory_templates?.template_fields || []
      const processedFields = fields.map((field: any) => ({
        ...field,
        field_options: field.field_options ? JSON.parse(field.field_options) : null,
      }))
      setTemplateFields(processedFields)

      // Initialize custom field values
      const initialValues: Record<string, any> = {}
      processedFields.forEach((field: TemplateField) => {
        initialValues[field.field_name] = field.field_type === "boolean" ? false : ""
      })
      setCustomFieldValues(initialValues)
    }
  }

  const updateCustomFieldValue = (fieldName: string, value: any) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const validateCustomFields = () => {
    for (const field of templateFields) {
      if (field.is_required) {
        const value = customFieldValues[field.field_name]
        if (field.field_type === "boolean") {
          continue // Boolean fields are always valid
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
      // Validate required fields
      validateCustomFields()

      // Create item
      const { error: itemError } = await supabase.from("inventory_items").insert({
        inventory_id: inventoryId,
        name,
        description: description || null,
        quantity,
        custom_fields: customFieldValues,
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      })

      if (itemError) throw itemError

      router.push(`/dashboard/inventories/${inventoryId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!inventory) {
    return <div>Loading...</div>
  }

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
            <div>
              <h2 className="text-3xl font-bold text-foreground">Add Item</h2>
              <p className="text-lg text-muted-foreground">Add a new item to {inventory.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
                <CardDescription>Enter the basic details for this item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Office Chair, Laptop, Printer Paper"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this item..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., electronics, furniture (comma-separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {templateFields.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>Fill in the template-specific information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {templateFields.map((field) => (
                    <CustomFieldRenderer
                      key={field.id}
                      field={field}
                      value={customFieldValues[field.field_name]}
                      onChange={(value) => updateCustomFieldValue(field.field_name, value)}
                    />
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
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Adding..." : "Add Item"}
              </Button>
              <Link href={`/dashboard/inventories/${inventoryId}`}>
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
