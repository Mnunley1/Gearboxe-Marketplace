"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import type { Id } from "@gearboxe-market/convex/_generated/dataModel";
import { Button } from "@gearboxe-market/ui/button";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Footer } from "../../../../../../components/footer";
import { Navbar } from "../../../../../../components/navbar";

type OrgMessagePageProps = {
  params: Promise<{ conversationId: string }>;
};

export default function OrgMessagePage({ params }: OrgMessagePageProps) {
  const { conversationId } = use(params);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(
    isAuthenticated ? api.orgInbox.getMessages : "skip",
    isAuthenticated
      ? { conversationId: conversationId as Id<"orgConversations"> }
      : undefined
  );

  const sendMessage = useMutation(api.orgInbox.sendMessage);
  const markAsRead = useMutation(api.orgInbox.markAsRead);

  // Mark as read on mount / new messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead({
        conversationId: conversationId as Id<"orgConversations">,
      });
    }
  }, [messages, conversationId, markAsRead]);

  // Auto-scroll when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage({
        conversationId: conversationId as Id<"orgConversations">,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <Link
            className="mb-3 flex items-center gap-1 text-gray-500 text-sm transition-colors hover:text-primary"
            href="/myAccount/notifications"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notifications
          </Link>
          <h1 className="font-bold text-2xl text-gray-900">
            Organizer Message
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          {!messages && (
            <div className="flex h-64 items-center justify-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
            </div>
          )}
          {messages && messages.length === 0 && (
            <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
              No messages yet. Send the first message below.
            </div>
          )}
          {messages &&
            messages.length > 0 &&
            messages.map((msg) => {
              const isOwn = msg.senderRole === "vendor";
              return (
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  key={msg._id}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`font-medium text-xs ${isOwn ? "text-white/80" : "text-gray-500"}`}
                      >
                        {isOwn ? "You" : msg.senderName}
                        {!isOwn && (
                          <span className="ml-1 text-[10px] opacity-70">
                            (Organizer)
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${isOwn ? "text-white/60" : "text-gray-400"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="mt-3 flex gap-2" onSubmit={handleSend}>
          <input
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSending}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            value={newMessage}
          />
          <Button disabled={isSending || !newMessage.trim()} type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
