"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Save, Check } from "lucide-react"

interface AutoSaveFormProps {
  formId: string
  data: Record<string, any>
  onSave: (data: Record<string, any>) => Promise<void>
  children: React.ReactNode
}

export function AutoSaveForm({ formId, data, onSave, children }: AutoSaveFormProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveData = useCallback(async () => {
    if (saveStatus === "saving") return

    setSaveStatus("saving")
    try {
      await onSave(data)
      setSaveStatus("saved")
      setLastSaved(new Date())

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      setSaveStatus("error")
      console.error("Auto-save failed:", error)
    }
  }, [data, onSave, saveStatus])

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveStatus === "idle" && Object.keys(data).length > 0) {
        saveData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveData, saveStatus, data])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveStatus === "idle" && Object.keys(data).length > 0) {
        // Synchronous save for page unload
        localStorage.setItem(
          `autosave-${formId}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          }),
        )
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [formId, data, saveStatus])

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <Badge variant="secondary" className="text-xs">
            <Save className="h-3 w-3 mr-1 animate-spin" />
            Saving...
          </Badge>
        )
      case "saved":
        return (
          <Badge variant="default" className="text-xs">
            <Check className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="text-xs">
            Save failed
          </Badge>
        )
      default:
        return lastSaved ? (
          <div className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</div>
        ) : null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        <div className="ml-4">{getSaveStatusBadge()}</div>
      </div>
    </div>
  )
}
