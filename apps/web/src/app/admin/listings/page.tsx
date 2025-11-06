"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, CheckCircle, Eye, Filter, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminListingsPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

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
  const allVehicles = useQuery(api.admin.getAllVehicles);
  const approveVehicle = useMutation(api.vehicles.approveVehicle);
  const rejectVehicle = useMutation(api.vehicles.rejectVehicle);

  if (isAdmin === false) {
    redirect("/myAccount/my-listings");
  }

  if (isAdmin === undefined || !allVehicles) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  const filteredVehicles = allVehicles.filter((vehicle) => {
    if (statusFilter === "all") return true;
    return vehicle.status === statusFilter;
  });

  const handleApprove = async (vehicleId: string) => {
    try {
      await approveVehicle({ id: vehicleId as any });
    } catch (error) {
      console.error("Error approving vehicle:", error);
    }
  };

  const handleReject = async (vehicleId: string) => {
    if (confirm("Are you sure you want to reject this listing?")) {
      try {
        await rejectVehicle({ id: vehicleId as any });
      } catch (error) {
        console.error("Error rejecting vehicle:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-rejected";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedVehicleId = searchParams.get("vehicle");
  const selectedVehicle = selectedVehicleId
    ? allVehicles.find((v) => v._id === selectedVehicleId)
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
            <h1 className="font-bold text-3xl text-gray-900">
              Manage Listings
            </h1>
            <p className="text-gray-600">Review and approve vehicle listings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex space-x-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
            ].map((filter) => (
              <Button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as any)}
                size="sm"
                variant={statusFilter === filter.key ? "default" : "outline"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Listings Grid */}
        <div className="lg:col-span-2">
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredVehicles.map((vehicle) => (
                <Card className="overflow-hidden" key={vehicle._id}>
                  <div className="relative">
                    {vehicle.photos.length > 0 ? (
                      <img
                        alt={vehicle.title}
                        className="h-48 w-full object-cover"
                        src={vehicle.photos[0]}
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs capitalize ${getStatusColor(vehicle.status)}`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="mb-2 line-clamp-1 font-semibold text-lg">
                      {vehicle.title}
                    </h3>
                    <p className="mb-2 text-gray-600 text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <div className="mb-4 flex items-center justify-between text-gray-600 text-sm">
                      <span>{vehicle.mileage.toLocaleString()} miles</span>
                      <span className="font-semibold text-lg text-primary">
                        ${vehicle.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-4 text-gray-500 text-xs">
                      <p>Listed by: {vehicle.user?.name}</p>
                      <p>Contact: {vehicle.contactInfo}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        asChild
                        className="flex-1"
                        size="sm"
                        variant="outline"
                      >
                        <Link href={`/vehicles/${vehicle._id}`}>
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {vehicle.status === "pending" && (
                        <>
                          <Button
                            className="admin-success-btn"
                            onClick={() => handleApprove(vehicle._id)}
                            size="sm"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            className="admin-danger-btn"
                            onClick={() => handleReject(vehicle._id)}
                            size="sm"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
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
                  No Listings Found
                </h3>
                <p className="text-gray-600">
                  {statusFilter === "all"
                    ? "No vehicle listings have been submitted yet."
                    : `No ${statusFilter} listings found.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Total Listings</span>
                <span className="font-medium">{allVehicles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Pending</span>
                <span className="font-medium text-yellow-600">
                  {allVehicles.filter((v) => v.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Approved</span>
                <span className="font-medium text-green-600">
                  {allVehicles.filter((v) => v.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Rejected</span>
                <span className="font-medium text-red-600">
                  {allVehicles.filter((v) => v.status === "rejected").length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/events">Manage Events</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/checkin">Event Check-in</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
