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
import { Calendar, MapPin, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "../../../lib/admin-auth-context";

export default function AdminEventsPage() {
  const { city } = useAdminAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const allEvents = useQuery(api.admin.getAllEvents);
  const cities = useQuery(api.cities.getCities);
  const deleteEvent = useMutation(api.events.deleteEvent);

  if (!(allEvents && cities)) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-sm">
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
            <h1 className="font-bold font-heading text-3xl text-gray-900">
              Manage Events
            </h1>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-5 w-5" />
            New Event
          </Button>
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-heading">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <EventCreateForm
              cities={cities}
              onSuccess={() => {
                setShowCreateForm(false);
                window.location.reload();
              }}
              orgCityId={city?._id ?? null}
            />
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      {allEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event) => (
            <Card
              className="overflow-hidden transition-all duration-300 hover:border-gray-300/80 hover:shadow-lg"
              key={event._id}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="line-clamp-1 font-semibold text-xl">
                      {event.name}
                    </h3>
                    {event.city && (
                      <p className="text-gray-600 text-sm">
                        {event.city.name}, {event.city.state}
                      </p>
                    )}
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
  cities,
  orgCityId,
  onSuccess,
}: {
  cities: any[];
  orgCityId: string | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    cityId: orgCityId ?? "",
    name: "",
    date: "",
    location: "",
    address: "",
    capacity: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEvent = useMutation(api.events.createEvent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !(
        formData.cityId &&
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
        cityId: formData.cityId as any,
        name: formData.name,
        date: new Date(formData.date).getTime(),
        location: formData.location,
        address: formData.address,
        capacity: Number.parseInt(formData.capacity, 10),
        description: formData.description,
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city-select">City *</Label>
          <select
            className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 text-sm shadow-sm transition-all duration-200 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
            disabled={!!orgCityId}
            id="city-select"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cityId: e.target.value }))
            }
            required
            value={formData.cityId}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

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

        <div className="space-y-2">
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
              cityId: "",
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
