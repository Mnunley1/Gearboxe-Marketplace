"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import type { Id } from "@gearboxe-market/convex/_generated/dataModel";
import { Button } from "@gearboxe-market/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { Input } from "@gearboxe-market/ui/input";
import { Label } from "@gearboxe-market/ui/label";
import { Textarea } from "@gearboxe-market/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  MapPin,
  Megaphone,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "../../../../lib/admin-auth-context";

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = use(params);
  useAdminAuth();

  const events = useQuery(api.admin.getAllEvents);
  const event = events?.find((e) => e._id === eventId);

  const registrations = useQuery(
    api.registrations.getRegistrationsByEvent,
    event ? { eventId: event._id } : "skip"
  );

  const announcements = useQuery(
    api.announcements.getByEvent,
    event ? { eventId: event._id } : "skip"
  );

  if (!events) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-gray-600">Event not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    );
  }

  const completedRegs = registrations?.filter(
    (r) => r.paymentStatus === "completed"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          className="mb-4 flex items-center gap-1 text-gray-500 text-sm hover:text-primary"
          href="/events"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
          {event.name}
        </h1>
        <div className="mt-2 flex flex-wrap gap-4 text-gray-600 text-sm">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {completedRegs?.length ?? 0} / {event.capacity} vendors
          </span>
        </div>
        <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Registrations */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Users className="h-5 w-5 text-primary" />
                Registrations ({completedRegs?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!registrations && (
                <p className="text-gray-500 text-sm">Loading...</p>
              )}
              {registrations &&
                (!completedRegs || completedRegs.length === 0) && (
                  <p className="text-gray-500 text-sm">
                    No completed registrations yet.
                  </p>
                )}
              {completedRegs && completedRegs.length > 0 && (
                <div className="space-y-3">
                  {completedRegs.map((reg) => (
                    <div
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      key={reg._id}
                    >
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {reg.user?.name ?? "Unknown"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {reg.vehicle
                            ? `${reg.vehicle.year} ${reg.vehicle.make} ${reg.vehicle.model}`
                            : "Unknown vehicle"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.checkedIn && (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3" />
                            Checked in
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-1">
          <AnnouncementSection
            announcements={announcements}
            eventId={event._id}
          />
        </div>
      </div>
    </div>
  );
}

function AnnouncementSection({
  eventId,
  announcements,
}: {
  eventId: Id<"events">;
  announcements:
    | {
        _id: string;
        title: string;
        content: string;
        createdAt: number;
        authorName: string;
      }[]
    | undefined;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createAnnouncement = useMutation(api.announcements.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(title.trim() && content.trim())) return;

    setIsSubmitting(true);
    try {
      await createAnnouncement({
        eventId,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      toast.success("Announcement posted", {
        description: "Email notifications will be sent to all registrants.",
      });
    } catch (error: any) {
      toast.error("Failed to post announcement", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-gray-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Megaphone className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post Form */}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              value={title}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-content">Message</Label>
            <Textarea
              id="ann-content"
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement..."
              rows={3}
              value={content}
            />
          </div>
          <Button
            className="w-full"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            size="sm"
            type="submit"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Posting..." : "Post Announcement"}
          </Button>
        </form>

        {/* Past Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="border-gray-200 border-t pt-4">
            <h4 className="mb-3 font-medium text-gray-700 text-sm">
              Past Announcements
            </h4>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div className="rounded-lg bg-gray-50 p-3" key={ann._id}>
                  <div className="mb-1 font-medium text-gray-900 text-sm">
                    {ann.title}
                  </div>
                  <p className="whitespace-pre-wrap text-gray-600 text-xs">
                    {ann.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-gray-400 text-xs">
                    <span>{ann.authorName}</span>
                    <span>
                      {new Date(ann.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
