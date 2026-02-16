"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { useQuery } from "convex/react";
import { Calendar, Car, CheckCircle, Clock, Database } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "../../lib/admin-auth-context";

export default function AdminDashboardPage() {
  const { city } = useAdminAuth();

  const adminStats = useQuery(api.admin.getAdminStats);
  const pendingVehicles = useQuery(api.admin.getAllVehicles);
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);

  if (!(adminStats && pendingVehicles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingVehiclesList = pendingVehicles.filter(
    (v) => v.status === "pending"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold font-heading text-3xl text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          {city
            ? `Managing ${city.name}, ${city.state}`
            : "Global view (all cities)"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-primary/10 p-2">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Total Vehicles
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {adminStats.totalVehicles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Pending Approval
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {adminStats.pendingVehicles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">Approved</p>
                <p className="font-bold text-2xl text-gray-900">
                  {adminStats.approvedVehicles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-primary-100 p-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-600 text-sm">
                  Upcoming Events
                </p>
                <p className="font-bold text-2xl text-gray-900">
                  {adminStats.upcomingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button asChild className="text-white">
                  <Link href="/listings">
                    <Car className="h-5 w-5" />
                    Manage Listings
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/events">
                    <Calendar className="h-5 w-5" />
                    Manage Events
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/checkin">
                    <CheckCircle className="h-5 w-5" />
                    Event Check-in
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/seed">
                    <Database className="h-5 w-5" />
                    Seed Database
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">
                Pending Approvals ({pendingVehiclesList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVehiclesList.length > 0 ? (
                <div className="space-y-4">
                  {pendingVehiclesList.slice(0, 5).map((vehicle) => (
                    <div
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors duration-200 hover:bg-gray-50"
                      key={vehicle._id}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {vehicle.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {vehicle.year} {vehicle.make} {vehicle.model} • $
                          {vehicle.price.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Listed by {vehicle.user?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/listings?vehicle=${vehicle._id}`}>
                            Review
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingVehiclesList.length > 5 && (
                    <div className="text-center">
                      <Button asChild variant="outline">
                        <Link href="/listings">View All Pending</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-400" />
                  <p className="text-gray-600">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      className="rounded-lg border border-gray-200 p-3 transition-colors duration-200 hover:bg-gray-50"
                      key={event._id}
                    >
                      <h4 className="font-medium text-sm">{event.name}</h4>
                      <p className="text-gray-600 text-xs">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-xs">{event.location}</p>
                      <div className="mt-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/events?event=${event._id}`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-gray-600 text-sm">No upcoming events</p>
                </div>
              )}
              <div className="mt-4">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/events">Manage Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
