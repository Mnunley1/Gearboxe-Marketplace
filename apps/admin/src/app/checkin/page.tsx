"use client";

import { api } from "@car-market/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Download,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRScannerComponent } from "@/components/ui/qr-scanner";

type ScanResult = {
  status: "loading" | "not_found" | "already_checked_in" | "found";
  data?: {
    registrationId: string;
    sellerName: string;
    vehicleTitle: string;
    vehicleYear: number;
    vehicleMake: string;
    vehicleModel: string;
    eventName: string;
  };
};

export default function AdminCheckinPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const convex = useConvex();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const isAdmin = useQuery(api.users.isAdmin);
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);
  const eventRegistrations = useQuery(
    api.registrations.getRegistrationsByEvent,
    selectedEvent ? { eventId: selectedEvent as any } : "skip"
  );
  const sheetData = useQuery(
    api.registrations.getCheckInSheetData,
    selectedEvent ? { eventId: selectedEvent as any } : "skip"
  );
  const checkInRegistration = useMutation(
    api.registrations.checkInRegistration
  );

  const handleQRScan = useCallback(
    async (data: string) => {
      setScanResult({ status: "loading" });
      setDialogOpen(true);

      try {
        const result = await convex.query(api.registrations.validateQRCode, {
          qrCodeData: data,
        });

        if (!result) {
          setScanResult({ status: "not_found" });
          return;
        }

        if (result.alreadyCheckedIn) {
          setScanResult({
            status: "already_checked_in",
            data: {
              registrationId: result.registration._id,
              sellerName: result.user?.name ?? "Unknown",
              vehicleTitle: result.vehicle?.title ?? "Unknown Vehicle",
              vehicleYear: result.vehicle?.year ?? 0,
              vehicleMake: result.vehicle?.make ?? "",
              vehicleModel: result.vehicle?.model ?? "",
              eventName: result.event?.name ?? "Unknown Event",
            },
          });
          return;
        }

        setScanResult({
          status: "found",
          data: {
            registrationId: result.registration._id,
            sellerName: result.user?.name ?? "Unknown",
            vehicleTitle: result.vehicle?.title ?? "Unknown Vehicle",
            vehicleYear: result.vehicle?.year ?? 0,
            vehicleMake: result.vehicle?.make ?? "",
            vehicleModel: result.vehicle?.model ?? "",
            eventName: result.event?.name ?? "Unknown Event",
          },
        });
      } catch (error) {
        console.error("QR validation error:", error);
        setScanResult({ status: "not_found" });
      }
    },
    [convex]
  );

  const handleConfirmCheckIn = useCallback(async () => {
    if (!scanResult?.data) return;
    setCheckingIn(true);
    try {
      await checkInRegistration({
        id: scanResult.data.registrationId as any,
      });
      toast.success("Check-in successful", {
        description: `${scanResult.data.sellerName} — ${scanResult.data.vehicleYear} ${scanResult.data.vehicleMake} ${scanResult.data.vehicleModel}`,
      });
      setDialogOpen(false);
      setScanResult(null);
    } catch (error: any) {
      toast.error("Check-in failed", {
        description: error?.message ?? "An unexpected error occurred",
      });
    } finally {
      setCheckingIn(false);
    }
  }, [scanResult, checkInRegistration]);

  const handleManualCheckIn = useCallback(
    async (registrationId: string) => {
      try {
        await checkInRegistration({ id: registrationId as any });
        toast.success("Check-in successful");
      } catch (error: any) {
        toast.error("Check-in failed", {
          description: error?.message ?? "An unexpected error occurred",
        });
      }
    },
    [checkInRegistration]
  );

  const handleDownloadCSV = useCallback(() => {
    if (!sheetData) return;

    const headers = [
      "Seller Name",
      "Email",
      "Phone",
      "Vehicle",
      "Year",
      "Make",
      "Model",
      "VIN",
      "Checked In",
      "QR Code",
    ];

    const escape = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvRows = [
      headers.join(","),
      ...sheetData.rows.map((row) =>
        [
          escape(row.sellerName),
          escape(row.sellerEmail),
          escape(row.sellerPhone),
          escape(row.vehicleTitle),
          String(row.vehicleYear),
          escape(row.vehicleMake),
          escape(row.vehicleModel),
          escape(row.vin),
          row.checkedIn ? "Yes" : "No",
          escape(row.qrCodeData),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheetData.eventName.replace(/[^a-zA-Z0-9]/g, "_")}_checkin_sheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sheetData]);

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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Registrations List */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Registrations for {selectedEventData?.name}
                    {eventRegistrations && (
                      <span className="ml-2 font-normal text-gray-600 text-sm">
                        ({eventRegistrations.length} total)
                      </span>
                    )}
                  </CardTitle>
                  {sheetData && sheetData.rows.length > 0 && (
                    <Button
                      onClick={handleDownloadCSV}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download Sheet
                    </Button>
                  )}
                </div>
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

      {/* QR Scan Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {scanResult?.status === "loading" && (
            <>
              <DialogHeader>
                <DialogTitle>Validating QR Code...</DialogTitle>
                <DialogDescription>
                  Looking up registration details.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
              </div>
            </>
          )}

          {scanResult?.status === "not_found" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  No Matching Registration
                </DialogTitle>
                <DialogDescription>
                  This QR code does not match any paid registration. It may be
                  invalid or belong to an unpaid registration.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setScanResult(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}

          {scanResult?.status === "already_checked_in" && scanResult.data && (
            <>
              <DialogHeader>
                <DialogTitle className="text-amber-600">
                  Already Checked In
                </DialogTitle>
                <DialogDescription>
                  This registration has already been checked in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-lg bg-amber-50 p-4 text-sm">
                <p>
                  <span className="font-medium">Seller:</span>{" "}
                  {scanResult.data.sellerName}
                </p>
                <p>
                  <span className="font-medium">Vehicle:</span>{" "}
                  {scanResult.data.vehicleYear} {scanResult.data.vehicleMake}{" "}
                  {scanResult.data.vehicleModel}
                </p>
                <p>
                  <span className="font-medium">Event:</span>{" "}
                  {scanResult.data.eventName}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setScanResult(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}

          {scanResult?.status === "found" && scanResult.data && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Check-In</DialogTitle>
                <DialogDescription>
                  Review the registration details and confirm check-in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-lg bg-green-50 p-4 text-sm">
                <p>
                  <span className="font-medium">Seller:</span>{" "}
                  {scanResult.data.sellerName}
                </p>
                <p>
                  <span className="font-medium">Vehicle:</span>{" "}
                  {scanResult.data.vehicleYear} {scanResult.data.vehicleMake}{" "}
                  {scanResult.data.vehicleModel}
                </p>
                <p>
                  <span className="font-medium">Event:</span>{" "}
                  {scanResult.data.eventName}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setScanResult(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800"
                  disabled={checkingIn}
                  onClick={handleConfirmCheckIn}
                >
                  {checkingIn ? "Checking In..." : "Confirm Check-In"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
