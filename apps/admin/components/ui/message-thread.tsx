"use client";

import { api } from "@car-market/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Check, CheckCheck, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { Textarea } from "@car-market/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";

type Message = {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: number;
  sender?: {
    name: string;
  };
};

type MessageThreadProps = {
  vehicleId: string;
  recipientId: string;
  recipientName?: string;
  conversationId?: string;
};

export function MessageThread({
  vehicleId,
  recipientId,
  recipientName,
  conversationId,
}: MessageThreadProps) {
  const { user: convexUser } = useCurrentUser();
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(
    conversationId
      ? api.messages.getMessagesByConversation
      : api.messages.getMessagesByVehicle,
    conversationId
      ? { conversationId: conversationId as any }
      : { vehicleId: vehicleId as any }
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const markConversationAsRead = useMutation(
    api.messages.markConversationAsRead
  );

  useEffect(() => {
    // Mark messages as read when component mounts
    if (messages && convexUser && conversationId) {
      // Use the new conversation-based mark as read
      markConversationAsRead({
        conversationId: conversationId as any,
        userId: convexUser._id as any,
      });
    } else if (messages && convexUser) {
      // Fallback to individual message marking
      for (const message of messages) {
        if (message.recipientId === convexUser._id && !message.read) {
          markAsRead({ messageId: message._id });
        }
      }
    }
  }, [
    messages,
    convexUser,
    markAsRead,
    markConversationAsRead,
    conversationId,
  ]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSendMessage = async () => {
    if (!(newMessage.trim() && convexUser)) return;

    setIsLoading(true);
    try {
      await sendMessage({
        senderId: convexUser._id as any,
        recipientId: recipientId as any,
        vehicleId: vehicleId as any,
        content: newMessage.trim(),
      });
      setNewMessage("");
      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (!convexUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Please sign in to send messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="border-gray-200 border-b pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span>Messages {recipientName && `with ${recipientName}`}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col space-y-4 overflow-hidden p-0">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages && messages.length > 0 ? (
            messages.map((message: Message) => {
              const isOwnMessage = message.senderId === convexUser._id;
              return (
                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  key={message._id}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm ${
                      isOwnMessage
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p
                        className={`text-xs ${
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                      {isOwnMessage && (
                        <div className="ml-2">
                          {message.read ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-2 font-medium text-lg">No messages yet</p>
              <p className="text-sm">
                Start the conversation by sending a message below!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-gray-200 border-t bg-gray-50 p-4">
          <div className="flex space-x-2">
            <Textarea
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              value={newMessage}
            />
            <Button
              className="rounded-lg px-4 py-2"
              disabled={!newMessage.trim() || isLoading}
              onClick={handleSendMessage}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isLoading && (
            <p className="mt-2 text-center text-gray-500 text-xs">
              Sending message...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
