"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent } from "@gearboxe-market/ui/card";
import { useQuery } from "convex/react";
import {
  Calendar,
  ChevronRight,
  Clock,
  MessageCircle,
  Plus,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NewOrgConversationDialog } from "../../../components/ui/new-org-conversation-dialog";
import { useAdminAuth } from "../../../lib/admin-auth-context";

export default function AdminMessagesPage() {
  useAdminAuth();
  const [showNewDialog, setShowNewDialog] = useState(false);

  const conversations = useQuery(api.orgInbox.getConversationsByOrg);

  if (!conversations) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Group conversations by event
  const grouped = conversations.reduce<Record<string, typeof conversations>>(
    (acc, conv) => {
      const key = conv.eventName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(conv);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
              Messages
            </h1>
            <p className="text-gray-500">Communicate with event vendors</p>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
          </div>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-5 w-5" />
            New Conversation
          </Button>
        </div>
      </div>

      {showNewDialog && (
        <NewOrgConversationDialog onClose={() => setShowNewDialog(false)} />
      )}

      {conversations.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([eventName, convs]) => (
            <div key={eventName}>
              <div className="mb-3 flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{eventName}</span>
                <span className="text-gray-400">
                  ({convs.length} conversation{convs.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="space-y-3">
                {convs
                  .sort(
                    (a, b) =>
                      (b.lastMessage?.createdAt ?? b.createdAt) -
                      (a.lastMessage?.createdAt ?? a.createdAt)
                  )
                  .map((conv) => (
                    <Card
                      className="group cursor-pointer overflow-hidden border-gray-200/60 transition-all duration-200 hover:border-gray-300/80 hover:shadow-md"
                      key={conv._id}
                    >
                      <Link className="block" href={`/messages/${conv._id}`}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {conv.vendorName}
                                  </span>
                                  {conv.unreadCount > 0 && (
                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-[10px] text-white">
                                      {conv.unreadCount}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                  {conv.lastMessage && (
                                    <>
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {formatTime(conv.lastMessage.createdAt)}
                                      </span>
                                    </>
                                  )}
                                  <ChevronRight className="h-4 w-4 transition-colors group-hover:text-primary" />
                                </div>
                              </div>
                              {conv.lastMessage && (
                                <p className="mt-1 truncate text-gray-500 text-sm">
                                  {conv.lastMessage.senderRole === "admin" && (
                                    <span className="text-gray-400">You: </span>
                                  )}
                                  {conv.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 font-semibold text-gray-900 text-xl">
              No Conversations Yet
            </h3>
            <p className="mb-6 text-gray-600">
              Start a conversation with an event vendor.
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-5 w-5" />
              New Conversation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
