"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface TemplateField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
  field_options: string[] | null
  is_required: boolean
}

interface CustomFieldRendererProps {
  field: TemplateField
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function CustomFieldRenderer({ field, value, onChange, disabled = false }: CustomFieldRendererProps) {
  return (
    <div className="grid gap-2">
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
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.is_required}
        />
      )}

      {field.field_type === "number" && (
        <Input
          id={field.id}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.is_required}
        />
      )}

      {field.field_type === "date" && (
        <Input
          id={field.id}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.is_required}
        />
      )}

      {field.field_type === "boolean" && (
        <div className="flex items-center space-x-2">
          <Switch id={field.id} checked={value || false} onCheckedChange={onChange} disabled={disabled} />
          <Label htmlFor={field.id} className="text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      )}

      {field.field_type === "select" && field.field_options && (
        <Select value={value || ""} onValueChange={onChange} disabled={disabled} required={field.is_required}>
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
  )
}
