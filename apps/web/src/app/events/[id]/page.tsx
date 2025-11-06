"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";
import { VehicleCard } from "../../../../components/vehicle-card";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn } = useAuth();
  const event = useQuery(api.events.getEventById, { id: params.id as any });
  const registrations = useQuery(api.registrations.getRegistrationsByEvent, {
    eventId: params.id as any,
  });

  if (!event) {
    return notFound();
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const { date, time } = formatDate(event.date);
  const isUpcoming = event.date > Date.now();
  const registeredVehicles =
    registrations?.map((reg) => reg.vehicleId).filter(Boolean) || [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center space-x-2 text-gray-600 text-sm">
            <Link
              className="transition-colors hover:text-primary"
              href="/events"
            >
              Events
            </Link>
            <span>/</span>
            <span>{event.name}</span>
          </div>

          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            {event.name}
          </h1>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  <span>Event Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {event.capacity} vendors</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{event.description}</p>
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">
                    <strong>Address:</strong> {event.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration CTA */}
        {isUpcoming && (
          <div className="mb-12 rounded-lg bg-primary p-8 text-center text-white">
            <h2 className="mb-4 font-bold text-2xl">Ready to Sell Your Car?</h2>
            <p className="mx-auto mb-6 max-w-2xl text-primary-foreground/90">
              Register as a vendor and showcase your vehicle to hundreds of
              potential buyers. Get exposure and sell your car faster at our
              community event.
            </p>
            {isAuthenticated || isSignedIn ? (
              <Button asChild size="lg" variant="secondary">
                <Link href="/myAccount/new-listing">Register as Vendor</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="secondary">
                <Link href="/sign-up">Sign Up to Register</Link>
              </Button>
            )}
          </div>
        )}

        {/* Registered Vehicles */}
        <div>
          <h2 className="mb-6 font-bold text-2xl text-gray-900">
            Registered Vehicles ({registeredVehicles.length})
          </h2>

          {registeredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {registeredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  No vehicles registered yet. Check back closer to the event
                  date!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Event Status */}
        {!isUpcoming && (
          <div className="mt-12 rounded-lg bg-gray-50 p-8 text-center">
            <h3 className="mb-2 font-semibold text-gray-900 text-xl">
              Event Completed
            </h3>
            <p className="text-gray-600">
              This event has already taken place. Check out our upcoming events
              for the next opportunity.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/events">View Upcoming Events</Link>
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
