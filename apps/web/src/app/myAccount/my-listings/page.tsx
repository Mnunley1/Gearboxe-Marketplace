"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent } from "@car-market/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@car-market/ui/select";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Heart,
  Plus,
  QrCode,
  Share2,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";
import { QRDisplay } from "../../../../components/qr-display";

type VehicleAnalyticsProps = {
  vehicleId: string;
  formatNumber: (num: number) => string;
};

function VehicleAnalytics({ vehicleId, formatNumber }: VehicleAnalyticsProps) {
  const analytics = useQuery(
    api.analytics.getVehicleAnalytics,
    vehicleId ? { vehicleId: vehicleId as any } : "skip"
  );

  if (!analytics) return null;

  return (
    <div className="flex items-center gap-4 text-gray-600 text-sm">
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <span>{formatNumber(analytics.views)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Share2 className="h-4 w-4" />
        <span>{formatNumber(analytics.shares)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="h-4 w-4" />
        <span>{formatNumber(analytics.favorites)}</span>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  // Always call hooks to maintain hook order
  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const userVehicles = useQuery(
    api.vehicles.getVehiclesByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const userRegistrations = useQuery(
    api.registrations.getRegistrationsByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const deleteVehicle = useMutation(api.vehicles.deleteVehicle);
  const updateSaleStatus = useMutation(api.vehicles.updateSaleStatus);

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

  const createdVehicleId = searchParams.get("created");

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteVehicle({ id: vehicleId as any });
        router.refresh();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const handleSaleStatusChange = async (
    vehicleId: string,
    saleStatus: "available" | "salePending" | "sold"
  ) => {
    try {
      await updateSaleStatus({ id: vehicleId as any, saleStatus });
      router.refresh();
    } catch (error) {
      console.error("Error updating sale status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900">My Listings</h1>
              <p className="text-gray-600">
                Manage your vehicle listings and registrations
              </p>
            </div>
            <Button asChild className="text-white">
              <Link href="/myAccount/new-listing">
                <Plus className="mr-2 h-5 w-5" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {createdVehicleId && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              <p className="text-green-800">
                Your listing has been created successfully! It will be reviewed
                by our team.
              </p>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {userVehicles && userVehicles.length > 0 ? (
          <div className="space-y-4">
            {userVehicles.map((vehicle) => {
              const registration = userRegistrations?.find(
                (reg) => reg.vehicleId === vehicle._id
              );

              return (
                <Card
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                  key={vehicle._id}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section - Larger */}
                    <div className="relative h-48 w-full flex-shrink-0 sm:h-auto sm:w-80">
                      {vehicle.photos.length > 0 ? (
                        <img
                          alt={vehicle.title}
                          className="h-full w-full object-cover"
                          src={vehicle.photos[0]}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs ${getStatusColor(vehicle.status)}`}
                        >
                          {getStatusIcon(vehicle.status)}
                          <span className="capitalize">{vehicle.status}</span>
                        </span>
                      </div>

                      {/* Sale Status Overlay */}
                      {vehicle.saleStatus && vehicle.saleStatus !== "available" && (
                        <div
                          className={`absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center py-2 font-bold text-sm shadow-lg ${
                            vehicle.saleStatus === "sold"
                              ? "bg-red-200/80 text-red-900"
                              : vehicle.saleStatus === "salePending"
                                ? "bg-yellow-200/80 text-yellow-900"
                                : ""
                          }`}
                        >
                          {vehicle.saleStatus === "sold"
                            ? "SOLD"
                            : vehicle.saleStatus === "salePending"
                              ? "SALE PENDING"
                              : ""}
                        </div>
                      )}

                      {/* Registration Status */}
                      {registration && (
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center space-x-2">
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
                            {registration.qrCodeData && (
                              <Button
                                className="bg-white/80 hover:bg-white"
                                onClick={() =>
                                  setSelectedQR(registration.qrCodeData!)
                                }
                                size="sm"
                                variant="ghost"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Middle */}
                    <CardContent className="flex flex-1 flex-col justify-center p-6">
                      <div className="space-y-3">
                        <p className="font-semibold text-xl text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        
                        {/* Registration Info */}
                        {registration && (
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {registration.event?.name}
                            </p>
                            {registration.event?.date && (
                              <p className="text-gray-600 text-xs">
                                {new Date(
                                  registration.event.date
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <p className="font-semibold text-2xl text-primary">
                          ${vehicle.price.toLocaleString()}
                        </p>
                        
                        {/* Analytics Stats */}
                        <VehicleAnalytics
                          formatNumber={formatNumber}
                          vehicleId={vehicle._id}
                        />
                        
                        {/* Event Location */}
                        {vehicle.event && (
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {vehicle.event.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {vehicle.event.location}
                            </p>
                            {vehicle.event.date && (
                              <p className="text-gray-600 text-xs">
                                {new Date(
                                  vehicle.event.date
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Sale Status Selector */}
                        {vehicle.status === "approved" && (
                          <div>
                            <label className="mb-1 block text-gray-700 text-xs font-medium">
                              Sale Status
                            </label>
                            <Select
                              value={vehicle.saleStatus || "available"}
                              onValueChange={(value) =>
                                handleSaleStatusChange(
                                  vehicle._id,
                                  value as "available" | "salePending" | "sold"
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-40 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">
                                  Available
                                </SelectItem>
                                <SelectItem value="salePending">
                                  Sale Pending
                                </SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    {/* Actions Section - Right Side */}
                    <div className="flex flex-col justify-center gap-2 border-gray-200 border-l p-6 sm:w-48">
                      <Button
                        asChild
                        className="w-full"
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/vehicles/${vehicle._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Live
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full"
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/myAccount/edit-listing/${vehicle._id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="w-full">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                    />
                    <path
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  No Listings Yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Create your first vehicle listing to get started selling at
                  our events.
                </p>
                <Button asChild className="text-white">
                  <Link href="/myAccount/new-listing">
                    Create Your First Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Event QR Code</h3>
              <Button
                onClick={() => setSelectedQR(null)}
                size="sm"
                variant="ghost"
              >
                ×
              </Button>
            </div>
            <QRDisplay
              description="Show this QR code at the event for check-in"
              qrCodeData={selectedQR}
              title="Check-in QR Code"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
