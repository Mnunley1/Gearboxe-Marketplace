"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Calendar, MapPin, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminEventsPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const isAdmin = useQuery(api.users.isAdmin);
  const allEvents = useQuery(api.admin.getAllEvents);
  const cities = useQuery(api.cities.getCities);
  const deleteEvent = useMutation(api.events.deleteEvent);

  if (isAdmin === false) {
    redirect("/myAccount/my-listings");
  }

  if (isAdmin === undefined || !allEvents || !cities) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent({ id: eventId as any });
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const selectedEventId = searchParams.get("event");
  const selectedEvent = selectedEventId
    ? allEvents.find((e) => e._id === selectedEventId)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center space-x-4">
          <Button asChild size="sm" variant="ghost">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-gray-900">Manage Events</h1>
            <p className="text-gray-600">Create and manage car market events</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-2 h-5 w-5" />
            New Event
          </Button>
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <EventCreateForm
              cities={cities}
              onSuccess={() => {
                setShowCreateForm(false);
                // Refresh the page to show new event
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      {allEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((event) => (
            <Card className="overflow-hidden" key={event._id}>
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
                        <Calendar className="mr-1 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteEvent(event._id)}
                      size="sm"
                      variant="outline"
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
              Create your first car market event to get started.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-5 w-5" />
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
  onSuccess,
}: {
  cities: any[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    cityId: "",
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
          <label className="font-medium text-gray-700 text-sm" htmlFor="city">
            City *
          </label>
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            id="city"
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
          <label
            className="font-medium text-gray-700 text-sm"
            htmlFor="eventName"
          >
            Event Name *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            id="eventName"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Raleigh Car Market - March 2024"
            required
            type="text"
            value={formData.name}
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-gray-700 text-sm" htmlFor="date">
            Date *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            id="date"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
            type="datetime-local"
            value={formData.date}
          />
        </div>

        <div className="space-y-2">
          <label
            className="font-medium text-gray-700 text-sm"
            htmlFor="capacity"
          >
            Capacity *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            id="capacity"
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
          <label className="font-medium text-gray-700 text-sm">
            Location *
          </label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="e.g., Raleigh Convention Center"
            required
            type="text"
            value={formData.location}
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium text-gray-700 text-sm">Address *</label>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="e.g., 500 S Salisbury St, Raleigh, NC 27601"
            required
            type="text"
            value={formData.address}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium text-gray-700 text-sm">Description</label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe the event, parking information, etc."
          rows={4}
          value={formData.description}
        />
      </div>

      <div className="flex justify-end space-x-4">
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
