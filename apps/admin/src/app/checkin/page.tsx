"use client";

import { api } from "@car-market/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, Calendar, Car, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRScannerComponent } from "@/components/ui/qr-scanner";

export default function AdminCheckinPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);

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
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);
  const eventRegistrations = selectedEvent
    ? useQuery(api.registrations.getRegistrationsByEvent, {
        eventId: selectedEvent as any,
      })
    : null;
  const checkInRegistration = useMutation(
    api.registrations.checkInRegistration
  );

  if (isAdmin === false) {
    redirect("/myAccount");
  }

  if (isAdmin === undefined || !upcomingEvents) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const handleQRScan = async (data: string) => {
    setScannedData(data);
    // In a real app, you'd validate the QR code and check in the user
    // For now, we'll just show the scanned data
  };

  const handleManualCheckIn = async (registrationId: string) => {
    try {
      await checkInRegistration({ id: registrationId as any });
      // Refresh the registrations list
      window.location.reload();
    } catch (error) {
      console.error("Error checking in registration:", error);
    }
  };

  const selectedEventData = selectedEvent
    ? upcomingEvents.find((e) => e._id === selectedEvent)
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
        <h1 className="font-bold text-3xl text-gray-900">Event Check-in</h1>
        <p className="text-gray-600">
          Scan QR codes or manually check in vendors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Event Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Event</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <button
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedEvent === event._id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      key={event._id}
                      onClick={() => setSelectedEvent(event._id)}
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {event.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {event.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Scanner */}
          {selectedEvent && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
              </CardHeader>
              <CardContent>
                <QRScannerComponent
                  onScan={handleQRScan}
                  title="Scan Vendor QR Code"
                />

                {scannedData && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 font-medium text-gray-700 text-sm">
                      Scanned Data:
                    </p>
                    <p className="break-all text-gray-600 text-xs">
                      {scannedData}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Registrations List */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Registrations for {selectedEventData?.name}
                  {eventRegistrations && (
                    <span className="ml-2 font-normal text-gray-600 text-sm">
                      ({eventRegistrations.length} total)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventRegistrations && eventRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {eventRegistrations.map((registration) => (
                      <div
                        className="flex items-center justify-between rounded-lg border p-4"
                        key={registration._id}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Car className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {registration.vehicle?.title}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {registration.vehicle?.year}{" "}
                                {registration.vehicle?.make}{" "}
                                {registration.vehicle?.model}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Vendor: {registration.user?.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              registration.checkedIn
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {registration.checkedIn
                              ? "Checked In"
                              : "Not Checked In"}
                          </span>

                          {!registration.checkedIn && (
                            <Button
                              className="bg-green-600 hover:bg-green-700 active:bg-green-800"
                              onClick={() =>
                                handleManualCheckIn(registration._id)
                              }
                              size="sm"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">
                      No registrations for this event
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  Select an Event
                </h3>
                <p className="text-gray-600">
                  Choose an event from the list to view and manage registrations
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
