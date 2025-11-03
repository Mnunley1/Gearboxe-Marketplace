"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { useConvexAuth, useQuery } from "convex/react";
import { Calendar, Car, Star, Users } from "lucide-react";
import Link from "next/link";
import { EventCard } from "../../components/event-card";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { VehicleCard } from "../../components/vehicle-card";

export default function HomePage() {
  const { isAuthenticated } = useConvexAuth();
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);
  const featuredVehicles = useQuery(api.vehicles.getVehicles, {
    status: "approved",
  });

  // Get the next upcoming event
  const nextEvent = upcomingEvents?.[0];

  // Get featured vehicles (first 6 approved vehicles)
  const displayVehicles = featuredVehicles?.slice(0, 6) || [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-primary/5 py-24">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-sm">
                <Car className="mr-2 h-4 w-4" />
                Trusted by car enthusiasts nationwide
              </div>

              <h1 className="mb-6 font-bold text-5xl text-gray-900 leading-tight md:text-7xl">
                Find Your Next
                <span className="block bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Dream Car
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-3xl text-gray-600 text-xl leading-relaxed">
                Connect with local car sellers and buyers at our exclusive
                monthly popup events. Browse premium vehicles, attend curated
                events, and find the perfect car that matches your lifestyle.
              </p>

              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  className="px-10 py-4 text-lg text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                >
                  <Link className="flex items-center" href="/vehicles">
                    <Car className="mr-2 h-5 w-5" />
                    Browse Vehicles
                  </Link>
                </Button>
                <Button
                  asChild
                  className="border-2 px-10 py-4 text-lg transition-all duration-300 hover:bg-primary hover:text-white"
                  size="lg"
                  variant="outline"
                >
                  <Link className="flex items-center" href="/events">
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4 text-primary" />
                  <span>1,200+ Members</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-primary" />
                  <span>Monthly Events</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Event Section */}
        {nextEvent && (
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Don't Miss Out
                </div>

                <h2 className="mb-6 font-bold text-4xl text-gray-900 md:text-5xl">
                  Next Upcoming Event
                </h2>
                <p className="mx-auto max-w-2xl text-gray-600 text-xl leading-relaxed">
                  Join us at our next exclusive car market event. Connect with
                  fellow enthusiasts, discover amazing vehicles, and be part of
                  the community.
                </p>
              </div>

              <div className="mx-auto max-w-3xl">
                <div className="transform transition-all duration-300 hover:scale-105">
                  <EventCard event={nextEvent} showRegister={true} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Vehicles */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 font-medium text-primary text-sm">
                <Star className="mr-2 h-4 w-4" />
                Curated Selection
              </div>

              <h2 className="mb-6 font-bold text-4xl text-gray-900 md:text-5xl">
                Featured Vehicles
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600 text-xl leading-relaxed">
                Handpicked premium vehicles from our community of trusted
                sellers. Each car is carefully vetted for quality and
                authenticity.
              </p>
            </div>

            {featuredVehicles === undefined ? (
              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div className="animate-pulse" key={i}>
                    <div className="mb-4 h-48 rounded-lg bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                      <div className="h-3 w-1/3 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayVehicles.length > 0 ? (
              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {displayVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 py-20 text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-4 font-semibold text-2xl text-gray-900">
                  No vehicles available yet
                </h3>
                <p className="mx-auto mb-8 max-w-md text-gray-600">
                  We're working on bringing you amazing vehicles from our
                  community. Check back soon or attend our next event to see
                  what's available.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    className="border-2 transition-all duration-300 hover:bg-primary hover:text-white"
                    variant="outline"
                  >
                    <Link className="flex items-center" href="/events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Attend Next Event
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Link
                      className="flex items-center"
                      href="/myAccount/new-listing"
                    >
                      <Car className="mr-2 h-4 w-4" />
                      List Your Vehicle
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {displayVehicles.length > 0 && (
              <div className="text-center">
                <Button
                  asChild
                  className="border-2 px-8 py-4 text-lg transition-all duration-300 hover:bg-primary hover:text-white"
                  size="lg"
                  variant="outline"
                >
                  <Link className="flex items-center" href="/vehicles">
                    <Car className="mr-2 h-5 w-5" />
                    View All Vehicles
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary to-primary/90 py-24">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-0 h-full w-full bg-linear-to-r from-white/5 to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-8 inline-flex items-center rounded-full bg-white/20 px-4 py-2 font-medium text-sm text-white">
              <Star className="mr-2 h-4 w-4" />
              Join Our Community
            </div>

            <h2 className="mb-6 font-bold text-4xl text-white md:text-5xl">
              Ready to Sell Your Car?
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-white/90 text-xl leading-relaxed">
              Join our exclusive community of car enthusiasts and showcase your
              vehicle at our curated events. Get direct exposure to serious
              buyers and sell your car faster than traditional methods.
            </p>

            <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Button
                  asChild
                  className="px-10 py-4 text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                  variant="secondary"
                >
                  <Link
                    className="flex items-center"
                    href="/myAccount/new-listing"
                  >
                    <Car className="mr-2 h-5 w-5" />
                    List Your Car
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="px-10 py-4 text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="lg"
                  variant="secondary"
                >
                  <Link className="flex items-center" href="/sign-up">
                    <Users className="mr-2 h-5 w-5" />
                    Get Started
                  </Link>
                </Button>
              )}

              <Button
                asChild
                className="border-2 border-white px-10 py-4 text-lg text-white transition-all duration-300 hover:bg-white hover:text-primary"
                size="lg"
                variant="outline"
              >
                <Link className="flex items-center" href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  Attend Event
                </Link>
              </Button>
            </div>

            {/* Benefits */}
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-lg text-white">
                  Direct Access
                </h3>
                <p className="text-sm text-white/80">
                  Connect directly with serious buyers
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-lg text-white">
                  Curated Events
                </h3>
                <p className="text-sm text-white/80">
                  Monthly events with verified sellers
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-semibold text-lg text-white">
                  Quality Assured
                </h3>
                <p className="text-sm text-white/80">
                  All vehicles are pre-screened
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
