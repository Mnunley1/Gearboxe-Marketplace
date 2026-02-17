"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import type { Id } from "@gearboxe-market/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { useMutation, useQuery } from "convex/react";
import { Calendar, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NewOrgConversationDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const events = useQuery(api.admin.getAllEvents);
  const registrations = useQuery(
    api.registrations.getRegistrationsByEvent,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );

  const getOrCreate = useMutation(api.orgInbox.getOrCreateConversation);

  const completedRegs = registrations?.filter(
    (r) => r.paymentStatus === "completed"
  );

  // Deduplicate by userId
  const uniqueVendors = completedRegs
    ? Array.from(
        new Map(
          completedRegs.filter((r) => r.user).map((r) => [r.user!._id, r.user!])
        ).values()
      )
    : [];

  const handleSelectVendor = async (userId: Id<"users">) => {
    if (!selectedEventId) return;
    setIsCreating(true);
    try {
      const conversationId = await getOrCreate({
        eventId: selectedEventId,
        userId,
      });
      onClose();
      router.push(`/messages/${conversationId}`);
    } catch (error: any) {
      toast.error("Failed to create conversation", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md border-gray-200/60 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">
            {step === 1 ? "Select Event" : "Select Vendor"}
          </CardTitle>
          <button
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-2">
              {!events && (
                <p className="text-center text-gray-500 text-sm">
                  Loading events...
                </p>
              )}
              {events && events.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  No events found.
                </p>
              )}
              {events &&
                events.length > 0 &&
                events.map((event) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    key={event._id}
                    onClick={() => {
                      setSelectedEventId(event._id);
                      setStep(2);
                    }}
                    type="button"
                  >
                    <Calendar className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {event.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <button
                className="mb-3 text-primary text-sm hover:underline"
                onClick={() => {
                  setStep(1);
                  setSelectedEventId(null);
                }}
                type="button"
              >
                &larr; Back to events
              </button>
              {!registrations && (
                <p className="text-center text-gray-500 text-sm">
                  Loading vendors...
                </p>
              )}
              {registrations && uniqueVendors.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  No registered vendors for this event.
                </p>
              )}
              {registrations &&
                uniqueVendors.length > 0 &&
                uniqueVendors.map((vendor) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                    disabled={isCreating}
                    key={vendor._id}
                    onClick={() => handleSelectVendor(vendor._id)}
                    type="button"
                  >
                    <User className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {vendor.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {vendor.email}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
