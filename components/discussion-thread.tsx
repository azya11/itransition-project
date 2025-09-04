"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Discussion {
  id: string
  message: string
  created_at: string
  user_id: string
  profiles: {
    full_name: string | null
    email: string
  }
}

interface DiscussionThreadProps {
  inventoryId: string
  discussions: Discussion[]
  currentUserId: string
  canParticipate: boolean
}

export function DiscussionThread({
  inventoryId,
  discussions: initialDiscussions,
  currentUserId,
  canParticipate,
}: DiscussionThreadProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to new discussions
    const channel = supabase
      .channel(`discussions:${inventoryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussions",
          filter: `inventory_id=eq.${inventoryId}`,
        },
        async (payload) => {
          // Get the full discussion with profile info
          const { data: newDiscussion } = await supabase
            .from("discussions")
            .select(`
              *,
              profiles(full_name, email)
            `)
            .eq("id", payload.new.id)
            .single()

          if (newDiscussion) {
            setDiscussions((prev) => [...prev, newDiscussion])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [inventoryId])

  useEffect(() => {
    scrollToBottom()
  }, [discussions])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleMessageChange = (value: string) => {
    setNewMessage(value)

    // Auto-save draft (simple implementation)
    localStorage.setItem(`discussion-draft-${inventoryId}`, value)

    // Typing indicator
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("discussions").insert({
        inventory_id: inventoryId,
        user_id: currentUserId,
        message: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
      localStorage.removeItem(`discussion-draft-${inventoryId}`)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`discussion-draft-${inventoryId}`)
    if (draft) {
      setNewMessage(draft)
    }
  }, [inventoryId])

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const getDisplayName = (profile: Discussion["profiles"]) => {
    return profile.full_name || profile.email.split("@")[0]
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussion ({discussions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {discussions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No discussions yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              discussions.map((discussion) => (
                <div key={discussion.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(discussion.profiles.full_name, discussion.profiles.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{getDisplayName(discussion.profiles)}</span>
                      {discussion.user_id === currentUserId && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm bg-muted/50 rounded-lg p-3">{discussion.message}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      {canParticipate && (
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                {isTyping && <div className="text-xs text-muted-foreground">Draft saved automatically...</div>}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{newMessage.length}/1000 characters</div>
                <Button type="submit" disabled={!newMessage.trim() || isLoading}>
                  {isLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
