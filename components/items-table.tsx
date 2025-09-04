"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, Trash2, MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import { CustomFieldDisplay } from "@/components/custom-field-display"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  quantity: number
  custom_fields: Record<string, any>
  tags: string[]
  created_at: string
}

interface TemplateField {
  id: string
  field_name: string
  field_type: "text" | "number" | "date" | "boolean" | "select"
}

interface ItemsTableProps {
  items: InventoryItem[]
  templateFields: TemplateField[]
  canEdit: boolean
  inventoryId: string
}

export function ItemsTable({ items, templateFields, canEdit, inventoryId }: ItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const toggleAllItems = () => {
    setSelectedItems((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)))
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && canEdit && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedItems.length} items selected</span>
          <Button variant="outline" size="sm">
            Bulk Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {canEdit && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length}
                    onChange={toggleAllItems}
                    className="rounded"
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              {templateFields.slice(0, 2).map((field) => (
                <TableHead key={field.id}>{field.field_name}</TableHead>
              ))}
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {canEdit && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {item.description || <span className="text-muted-foreground italic">No description</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.quantity}</Badge>
                </TableCell>
                {templateFields.slice(0, 2).map((field) => (
                  <TableCell key={field.id}>
                    <div className="max-w-32 truncate">
                      <CustomFieldDisplay field={field} value={item.custom_fields?.[field.field_name]} />
                    </div>
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags && item.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/inventories/${inventoryId}/items/${item.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/inventories/${inventoryId}/items/${item.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
