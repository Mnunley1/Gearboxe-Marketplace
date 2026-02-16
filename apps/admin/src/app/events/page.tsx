"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
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
import { AlertTriangle, Calendar, MapPin, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "../../../lib/admin-auth-context";

export default function AdminEventsPage() {
  const { orgId } = useAdminAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const allEvents = useQuery(api.admin.getAllEvents);
  const deleteEvent = useMutation(api.events.deleteEvent);

  if (!allEvents) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleDeleteEvent = async (eventId: string) => {
    setPendingDeleteId(null);
    try {
      await deleteEvent({ id: eventId as any });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Delete confirmation */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Card className="mx-4 max-w-sm border-gray-200/60 shadow-xl">
            <CardContent className="p-6 text-center">
              <p className="mb-4 text-gray-900">
                Are you sure you want to delete this event?
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => setPendingDeleteId(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteEvent(pendingDeleteId)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
              Manage Events
            </h1>
            <p className="text-gray-500">Create and manage Gearboxe Market events</p>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-5 w-5" />
            New Event
          </Button>
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <Card className="mb-8 border-gray-200/60">
          <CardHeader>
            <CardTitle className="font-heading">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <EventCreateForm
              orgId={orgId}
              onSuccess={() => {
                setShowCreateForm(false);
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      {allEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event: any) => (
            <Card
              className="group hover:-translate-y-0.5 overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-gray-200/50 hover:shadow-xl"
              key={event._id}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="line-clamp-1 font-semibold text-xl">
                      {event.name}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 text-sm">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {event.capacity} vendors</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="line-clamp-3 text-gray-700 text-sm">
                      {event.description}
                    </p>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button
                      asChild
                      className="flex-1"
                      size="sm"
                      variant="outline"
                    >
                      <Link href={`/events/${event._id}`}>
                        <Calendar className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      className="text-red-600"
                      onClick={() => setPendingDeleteId(event._id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 font-semibold text-gray-900 text-xl">
              No Events Yet
            </h3>
            <p className="mb-6 text-gray-600">
              Create your first Gearboxe Market event to get started.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-5 w-5" />
              Create First Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Event Create Form Component
function EventCreateForm({
  orgId,
  onSuccess,
}: {
  orgId: string | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    address: "",
    capacity: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEvent = useMutation(api.events.createEvent);
  const stripeSettings = useQuery(api.stripeConnect.getOrgStripeSettings);
  const stripeNotReady = !stripeSettings?.onboardingComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !(
        orgId &&
        formData.name &&
        formData.date &&
        formData.location &&
        formData.address &&
        formData.capacity
      )
    ) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        clerkOrgId: orgId,
        name: formData.name,
        date: new Date(formData.date).getTime(),
        location: formData.location,
        address: formData.address,
        capacity: Number.parseInt(formData.capacity, 10),
        description: formData.description,
        vendorPrice: 50,
      });
      toast.success("Event Created", {
        description: "The event has been created successfully.",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage =
        error?.message || "Failed to create event. Please try again.";
      toast.error("Error Creating Event", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {stripeNotReady && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 text-sm">
              Stripe account not connected
            </p>
            <p className="mt-1 text-amber-700 text-sm">
              You must connect a Stripe account before creating paid events.{" "}
              <Link className="font-medium underline" href="/settings/stripe">
                Connect Stripe
              </Link>
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-name">Event Name *</Label>
          <Input
            id="event-name"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Raleigh Gearboxe Market - March 2024"
            required
            value={formData.name}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-date">Date *</Label>
          <Input
            id="event-date"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
            type="datetime-local"
            value={formData.date}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-capacity">Capacity *</Label>
          <Input
            id="event-capacity"
            min="1"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, capacity: e.target.value }))
            }
            placeholder="e.g., 50"
            required
            type="number"
            value={formData.capacity}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location">Location *</Label>
          <Input
            id="event-location"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="e.g., Raleigh Convention Center"
            required
            value={formData.location}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="event-address">Address *</Label>
          <Input
            id="event-address"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="e.g., 500 S Salisbury St, Raleigh, NC 27601"
            required
            value={formData.address}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-description">Description</Label>
        <Textarea
          id="event-description"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the event, parking information, etc."
          rows={4}
          value={formData.description}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={() => {
            setFormData({
              name: "",
              date: "",
              location: "",
              address: "",
              capacity: "",
              description: "",
            });
          }}
          type="button"
          variant="outline"
        >
          Clear Form
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
