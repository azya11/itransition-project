import { Badge } from "@/components/ui/badge"

interface TemplateField {
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
}

interface CustomFieldDisplayProps {
  field: TemplateField
  value: any
}

export function CustomFieldDisplay({ field, value }: CustomFieldDisplayProps) {
  const formatValue = () => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not set</span>
    }

    switch (field.field_type) {
      case "boolean":
        return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
      case "date":
        return new Date(value).toLocaleDateString()
      case "number":
        return Number(value).toLocaleString()
      default:
        return value
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="font-medium text-sm">{field.field_name}</span>
      <div className="text-sm">{formatValue()}</div>
    </div>
  )
}
