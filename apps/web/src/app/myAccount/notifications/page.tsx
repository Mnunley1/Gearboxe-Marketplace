"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import type { Id } from "@gearboxe-market/convex/_generated/dataModel";
import { Card, CardContent } from "@gearboxe-market/ui/card";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [activeTab, setActiveTab] = useState<"messages" | "announcements">(
    "messages"
  );

  const orgConversations = useQuery(
    isAuthenticated ? api.orgInbox.getConversationsByUser : "skip"
  );
  const announcements = useQuery(
    isAuthenticated ? api.announcements.getForUser : "skip"
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/sign-in");
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

  const msgUnread =
    orgConversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const annUnread = announcements?.filter((a) => !a.isRead).length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-4xl text-gray-900">
            Notifications
          </h1>
          <p className="text-gray-600 text-lg">
            Messages from event organizers and announcements
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 font-medium text-sm transition-colors ${
              activeTab === "messages"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("messages")}
            type="button"
          >
            <MessageCircle className="h-4 w-4" />
            Messages
            {msgUnread > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-[10px] text-white">
                {msgUnread}
              </span>
            )}
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 font-medium text-sm transition-colors ${
              activeTab === "announcements"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("announcements")}
            type="button"
          >
            <Megaphone className="h-4 w-4" />
            Announcements
            {annUnread > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-medium text-[10px] text-white">
                {annUnread}
              </span>
            )}
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <MessagesTab
            conversations={orgConversations}
            formatTime={formatTime}
          />
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <AnnouncementsTab
            announcements={announcements}
            formatTime={formatTime}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

function MessagesTab({
  conversations,
  formatTime,
}: {
  conversations:
    | {
        _id: string;
        eventName: string;
        lastMessage: {
          content: string;
          createdAt: number;
          senderRole: string;
        } | null;
        unreadCount: number;
      }[]
    | undefined;
  formatTime: (t: number) => string;
}) {
  if (!conversations) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (conversations.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mb-3 font-semibold text-2xl text-gray-900">
            No messages yet
          </h3>
          <p className="mx-auto max-w-md text-gray-600 leading-relaxed">
            When event organizers message you about your registrations,
            they&apos;ll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...conversations].sort(
    (a, b) => (b.lastMessage?.createdAt ?? 0) - (a.lastMessage?.createdAt ?? 0)
  );

  return (
    <div className="space-y-3">
      {sorted.map((conv) => (
        <Card
          className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
          key={conv._id}
        >
          <Link
            className="block"
            href={`/myAccount/notifications/messages/${conv._id}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {conv.eventName}
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
                          <span>{formatTime(conv.lastMessage.createdAt)}</span>
                        </>
                      )}
                      <ChevronRight className="h-4 w-4 transition-colors group-hover:text-primary" />
                    </div>
                  </div>
                  {conv.lastMessage && (
                    <p className="mt-1 truncate text-gray-500 text-sm">
                      {conv.lastMessage.senderRole === "vendor" && (
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
  );
}

function AnnouncementsTab({
  announcements,
  formatTime,
}: {
  announcements:
    | {
        _id: string;
        eventName: string;
        title: string;
        content: string;
        createdAt: number;
        isRead: boolean;
      }[]
    | undefined;
  formatTime: (t: number) => string;
}) {
  if (!announcements) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (announcements.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <Megaphone className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mb-3 font-semibold text-2xl text-gray-900">
            No announcements yet
          </h3>
          <p className="mx-auto max-w-md text-gray-600 leading-relaxed">
            Event announcements from organizers will appear here when
            you&apos;re registered for events.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann) => (
        <AnnouncementCard
          announcement={ann}
          formatTime={formatTime}
          key={ann._id}
        />
      ))}
    </div>
  );
}

function AnnouncementCard({
  announcement,
  formatTime,
}: {
  announcement: {
    _id: string;
    eventName: string;
    title: string;
    content: string;
    createdAt: number;
    isRead: boolean;
  };
  formatTime: (t: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const markRead = useMutation(api.announcements.markRead);

  const handleExpand = () => {
    if (!(expanded || announcement.isRead)) {
      markRead({
        announcementId: announcement._id as Id<"eventAnnouncements">,
      });
    }
    setExpanded(!expanded);
  };

  return (
    <Card
      className={`overflow-hidden border-0 shadow-md transition-all duration-200 ${
        announcement.isRead ? "" : "border-l-4 border-l-primary"
      }`}
    >
      <CardContent className="p-0">
        <button
          className="flex w-full items-center gap-4 p-5 text-left"
          onClick={handleExpand}
          type="button"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              announcement.isRead
                ? "bg-gray-100"
                : "bg-gradient-to-br from-primary/20 to-primary/10"
            }`}
          >
            <Megaphone
              className={`h-5 w-5 ${announcement.isRead ? "text-gray-400" : "text-primary"}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                {announcement.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">
                  {formatTime(announcement.createdAt)}
                </span>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              {announcement.eventName}
            </div>
          </div>
        </button>
        {expanded && (
          <div className="border-gray-100 border-t bg-gray-50 px-5 py-4">
            <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
              {announcement.content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
