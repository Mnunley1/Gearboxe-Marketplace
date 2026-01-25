"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowRight, Calendar, Car, CheckCircle2, Shield, Sparkles, Star, TrendingUp, Users } from "lucide-react";
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
  const displayVehicles = featuredVehicles?.vehicles?.slice(0, 6) || [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                The Modern Way to Buy & Sell Cars
              </div>

              {/* Main Heading */}
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                Find Your Perfect
                <span className="relative mx-2 inline-block">
                  <span className="relative z-10 text-gradient-primary">Dream Car</span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/10 -rotate-1 rounded" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 leading-relaxed sm:text-xl">
                Connect with local sellers at exclusive popup events. Browse curated vehicles,
                meet sellers in person, and drive away with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  <Link href="/vehicles" className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Browse Vehicles
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group"
                >
                  <Link href="/events" className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">1,200+ Members</span>
                </div>
                <div className="h-5 w-px bg-gray-200 hidden sm:block" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Verified Sellers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 text-white" viewBox="0 0 1440 48" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,48L60,42.7C120,37,240,27,360,26.7C480,27,600,37,720,42.7C840,48,960,48,1080,42.7C1200,37,1320,27,1380,21.3L1440,16L1440,48L1380,48C1320,48,1200,48,1080,48C960,48,840,48,720,48C600,48,480,48,360,48C240,48,120,48,60,48L0,48Z" />
            </svg>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Three simple steps to find or sell your next vehicle
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Car,
                  title: "Browse Vehicles",
                  description: "Explore our curated selection of quality pre-owned vehicles from verified local sellers.",
                  color: "bg-blue-500",
                },
                {
                  icon: Calendar,
                  title: "Attend an Event",
                  description: "Meet sellers in person at our monthly popup events. Test drive and inspect vehicles firsthand.",
                  color: "bg-emerald-500",
                },
                {
                  icon: CheckCircle2,
                  title: "Complete Your Purchase",
                  description: "Finalize the deal directly with the seller. Simple, transparent, and hassle-free.",
                  color: "bg-violet-500",
                },
              ].map((step, index) => (
                <div key={step.title} className="group relative">
                  <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-400 shadow-md border border-gray-100">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${step.color} text-white shadow-lg`}>
                      <step.icon className="h-7 w-7" />
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Event Section */}
        {nextEvent && (
          <section className="bg-white py-20 lg:py-24 border-y border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Calendar className="h-4 w-4" />
                    Don't Miss Out
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    Next Upcoming Event
                  </h2>
                </div>
                <Button asChild variant="outline" className="group">
                  <Link href="/events" className="flex items-center gap-2">
                    View All Events
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <div className="mx-auto max-w-3xl">
                <EventCard event={nextEvent} showRegister={true} />
              </div>
            </div>
          </section>
        )}

        {/* Featured Vehicles */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Featured Selection
                </div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Popular Vehicles
                </h2>
              </div>
              <Button asChild variant="outline" className="group">
                <Link href="/vehicles" className="flex items-center gap-2">
                  View All Vehicles
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {featuredVehicles === undefined || featuredVehicles.vehicles === undefined ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4" key={i}>
                    <div className="mb-4 aspect-[4/3] rounded-lg bg-gray-100" />
                    <div className="space-y-3">
                      <div className="h-5 w-3/4 rounded-lg bg-gray-100" />
                      <div className="h-4 w-1/2 rounded-lg bg-gray-100" />
                      <div className="flex justify-between pt-2">
                        <div className="h-6 w-1/3 rounded-lg bg-gray-100" />
                        <div className="h-4 w-1/4 rounded-lg bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayVehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Car className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  No vehicles available yet
                </h3>
                <p className="mx-auto mb-8 max-w-md text-gray-600">
                  We're working on bringing you amazing vehicles from our community. Check back soon!
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link href="/events" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Attend Next Event
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/myAccount/new-listing" className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      List Your Vehicle
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 py-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4" />
                Join Our Community
              </div>

              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to Sell Your Car?
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 leading-relaxed">
                Join thousands of sellers who've found buyers through our curated events.
                Get direct access to serious buyers and sell faster.
              </p>

              <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="group shadow-xl"
                  >
                    <Link href="/myAccount/new-listing" className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      List Your Car
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="group shadow-xl"
                  >
                    <Link href="/sign-up" className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Get Started Free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white active:bg-white/15"
                >
                  <Link href="/events" className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    View Events
                  </Link>
                </Button>
              </div>

              {/* Benefits Grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    icon: Users,
                    title: "Direct Access",
                    description: "Connect with serious buyers",
                  },
                  {
                    icon: Calendar,
                    title: "Monthly Events",
                    description: "Regular opportunities to sell",
                  },
                  {
                    icon: Shield,
                    title: "Verified Community",
                    description: "Trusted buyers and sellers",
                  },
                ].map((benefit) => (
                  <div key={benefit.title} className="rounded-xl bg-white/5 p-6 backdrop-blur-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
