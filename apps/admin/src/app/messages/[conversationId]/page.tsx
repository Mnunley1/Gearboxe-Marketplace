"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import type { Id } from "@gearboxe-market/convex/_generated/dataModel";
import { Button } from "@gearboxe-market/ui/button";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { useAdminAuth } from "../../../../lib/admin-auth-context";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default function AdminConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = use(params);
  useAdminAuth();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.orgInbox.getMessages, {
    conversationId: conversationId as Id<"orgConversations">,
  });

  const sendMessage = useMutation(api.orgInbox.sendMessage);
  const markAsRead = useMutation(api.orgInbox.markAsRead);

  // Mark as read on mount and when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      markAsRead({
        conversationId: conversationId as Id<"orgConversations">,
      });
    }
  }, [messages, conversationId, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally trigger scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

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
    <div
      className="mx-auto flex max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8"
      style={{ height: "calc(100vh - 2rem)" }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          className="flex items-center gap-1 text-gray-500 text-sm transition-colors hover:text-primary"
          href="/messages"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {messages && messages.length > 0 && (
          <span className="font-medium text-gray-700 text-sm">
            Conversation with{" "}
            {messages.find((m) => m.senderRole === "vendor")?.senderName ??
              "Vendor"}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
        {!messages && (
          <div className="flex h-full items-center justify-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
          </div>
        )}
        {messages && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No messages yet. Send the first message below.
          </div>
        )}
        {messages &&
          messages.length > 0 &&
          messages.map((msg) => {
            const isOwn = msg.senderRole === "admin";
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
                      {msg.senderName}
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
  );
}
