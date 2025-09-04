"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Users, Wifi, WifiOff } from "lucide-react"

interface RealTimeIndicatorProps {
  inventoryId: string
  currentUserId: string
}

export function RealTimeIndicator({ inventoryId, currentUserId }: RealTimeIndicatorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()

    // Track connection status
    const channel = supabase
      .channel(`presence:${inventoryId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const users = Object.keys(state)
        setActiveUsers(users.filter((id) => id !== currentUserId))
        setIsConnected(true)
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key !== currentUserId) {
          setActiveUsers((prev) => [...prev.filter((id) => id !== key), key])
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setActiveUsers((prev) => prev.filter((id) => id !== key))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [inventoryId, currentUserId])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>

      {activeUsers.length > 0 && (
        <Badge variant="outline" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          {activeUsers.length} online
        </Badge>
      )}
    </div>
  )
}
