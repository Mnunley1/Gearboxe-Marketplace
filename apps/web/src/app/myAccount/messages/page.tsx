"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent } from "@car-market/ui/card";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import {
  Car,
  ChevronRight,
  Clock,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

export default function MessagesPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "recent">(
    "all"
  );

  // Always call hooks to maintain hook order
  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const conversations = useQuery(
    api.messages.getConversations,
    currentUser?._id ? { userId: currentUser._id } : "skip"
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

  if (!(isAuthenticated && user)) {
    redirect("/sign-in");
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    }
    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (diffInHours < 168) {
      // 7 days
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

  const getStatusColor = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "bg-green-500";
    if (diffInHours < 24) return "bg-blue-500";
    return "bg-gray-400";
  };

  const filteredConversations =
    conversations?.filter((conversation) => {
      const matchesSearch =
        conversation.vehicleTitle
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conversation.otherUserName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (filterStatus === "unread") {
        return matchesSearch && conversation.unreadCount > 0;
      }
      if (filterStatus === "recent") {
        const diffInHours =
          (Date.now() - conversation.lastMessage.createdAt) / (1000 * 60 * 60);
        return matchesSearch && diffInHours < 24;
      }

      return matchesSearch;
    }) || [];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-bold text-4xl text-gray-900">
                Messages
              </h1>
              <p className="text-gray-600 text-lg">
                Connect with potential buyers and sellers
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <input
                  className="w-64 rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-primary"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  type="text"
                  value={searchQuery}
                />
              </div>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  className={`rounded-md px-3 py-1 font-medium text-sm transition-colors ${
                    filterStatus === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </button>
                <button
                  className={`rounded-md px-3 py-1 font-medium text-sm transition-colors ${
                    filterStatus === "unread"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setFilterStatus("unread")}
                >
                  Unread
                </button>
                <button
                  className={`rounded-md px-3 py-1 font-medium text-sm transition-colors ${
                    filterStatus === "recent"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setFilterStatus("recent")}
                >
                  Recent
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {conversations && conversations.length > 0 && (
            <div className="flex items-center space-x-6 text-gray-600 text-sm">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{conversations.length} conversations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>
                  {conversations.filter((c) => c.unreadCount > 0).length} unread
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Conversations List */}
        {filteredConversations.length > 0 ? (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <Card
                className="group cursor-pointer overflow-hidden border-0 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                key={`${conversation.vehicleId}-${conversation.otherUserId}`}
              >
                <Link
                  className="block"
                  href={`/myAccount/messages/${conversation.vehicleId}/${conversation.otherUserId}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                          <Car className="h-7 w-7 text-primary" />
                        </div>
                        <div
                          className={`-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white ${getStatusColor(conversation.lastMessage.createdAt)}`}
                        />
                      </div>

                      {/* Conversation details */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h3 className="truncate font-semibold text-gray-900 text-lg">
                              {conversation.vehicleTitle ||
                                "Vehicle Conversation"}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex animate-pulse items-center rounded-full bg-primary px-2.5 py-0.5 font-medium text-white text-xs">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-gray-500 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-primary" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-gray-600 text-sm">
                            <User className="h-4 w-4" />
                            <span className="truncate">
                              {conversation.otherUserName || "Unknown User"}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 truncate text-gray-600 text-sm leading-relaxed">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                No conversations match your search
              </h3>
              <p className="mb-6 text-gray-600">
                Try adjusting your search terms or filters.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-3 font-semibold text-2xl text-gray-900">
                No conversations yet
              </h3>
              <p className="mx-auto mb-8 max-w-md text-gray-600 leading-relaxed">
                Messages from potential buyers will appear here when they
                contact you about your listings. Start by listing your vehicle
                to begin conversations!
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button asChild>
                  <Link href="/myAccount/new-listing">
                    <Car className="mr-2 h-4 w-4" />
                    List Your Vehicle
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/vehicles">Browse Vehicles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
