"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { useMutation, useQuery } from "convex/react";
import { Car, CheckCircle, Eye, Filter, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "../../../lib/admin-auth-context";

export default function AdminListingsPage() {
  useAdminAuth();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const allVehicles = useQuery(api.admin.getAllVehicles);
  const approveVehicle = useMutation(api.vehicles.approveVehicle);
  const rejectVehicle = useMutation(api.vehicles.rejectVehicle);

  if (!allVehicles) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredVehicles = allVehicles.filter((vehicle: any) => {
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
    // biome-ignore lint/suspicious/noAlert: simple admin confirmation
    if (window.confirm("Are you sure you want to reject this listing?")) {
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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedVehicleId = searchParams.get("vehicle");
  const _selectedVehicle = selectedVehicleId
    ? allVehicles.find((v: any) => v._id === selectedVehicleId)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
              Manage Listings
            </h1>
            <p className="text-gray-500">Review and approve vehicle listings</p>
            <div className="mt-3 h-1 w-12 rounded-full bg-primary" />
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
              {filteredVehicles.map((vehicle: any) => (
                <Card
                  className="group hover:-translate-y-0.5 overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-gray-200/50 hover:shadow-xl"
                  key={vehicle._id}
                >
                  <div className="relative overflow-hidden">
                    {vehicle.photos.length > 0 ? (
                      <Image
                        alt={vehicle.title}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        height={192}
                        src={vehicle.photos[0]}
                        unoptimized
                        width={384}
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                        <Car className="h-8 w-8 text-gray-300" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium text-xs capitalize shadow-sm ${getStatusColor(vehicle.status)}`}
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
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {vehicle.status === "pending" && (
                        <>
                          <Button
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800"
                            onClick={() => handleApprove(vehicle._id)}
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(vehicle._id)}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4" />
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
                <Car className="mx-auto mb-4 h-12 w-12 text-gray-400" />
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
          <Card className="border-gray-200/60 transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-heading">Listing Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Total Listings</span>
                <span className="font-medium">{allVehicles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Pending</span>
                <span className="font-medium text-yellow-600">
                  {allVehicles.filter((v: any) => v.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Approved</span>
                <span className="font-medium text-green-600">
                  {allVehicles.filter((v: any) => v.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Rejected</span>
                <span className="font-medium text-red-600">
                  {allVehicles.filter((v: any) => v.status === "rejected").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
