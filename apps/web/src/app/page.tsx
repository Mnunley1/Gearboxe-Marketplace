"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { useConvexAuth, useQuery } from "convex/react";
import {
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  CircleGauge,
  ClipboardList,
  Eye,
  Globe,
  Heart,
  MessageCircle,
  Play,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
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
          <div className="-top-24 -left-24 absolute h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="-right-24 absolute top-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 font-medium text-primary text-sm">
                <Sparkles className="h-4 w-4" />
                Your Trusted Car Marketplace
              </div>

              {/* Main Heading */}
              <h1 className="mb-6 font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                The Marketplace for
                <span className="relative mx-2 inline-block">
                  <span className="relative z-10 text-gradient-primary">
                    Car Enthusiasts
                  </span>
                  <span className="-bottom-2 -rotate-1 absolute right-0 left-0 h-3 rounded bg-primary/10" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mb-10 max-w-2xl text-gray-600 text-lg leading-relaxed sm:text-xl">
                Gearboxe is the smarter way to buy and sell cars. Browse curated
                listings, connect with verified sellers, and find your next ride
                — all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  className="group shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
                  size="lg"
                >
                  <Link className="flex items-center gap-2" href="/vehicles">
                    <Search className="h-5 w-5" />
                    Explore the Marketplace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="group border-primary/20 hover:bg-primary/5"
                  size="lg"
                  variant="outline"
                >
                  <Link className="flex items-center gap-2" href="/events">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="-space-x-1 flex">
                    {["r1", "r2", "r3", "r4", "r5"].map((key) => (
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        key={key}
                      />
                    ))}
                  </div>
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">1,200+ Members</span>
                </div>
                <div className="hidden h-5 w-px bg-gray-200 sm:block" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Verified Sellers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Wave */}
          <div className="absolute right-0 bottom-0 left-0">
            <svg
              aria-hidden="true"
              className="h-12 w-full text-white"
              preserveAspectRatio="none"
              viewBox="0 0 1440 48"
            >
              <path
                d="M0,48L60,42.7C120,37,240,27,360,26.7C480,27,600,37,720,42.7C840,48,960,48,1080,42.7C1200,37,1320,27,1380,21.3L1440,16L1440,48L1380,48C1320,48,1200,48,1080,48C960,48,840,48,720,48C600,48,480,48,360,48C240,48,120,48,60,48L0,48Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600 text-lg">
                Three simple steps to find or sell your next vehicle
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Car,
                  title: "Browse Vehicles",
                  description:
                    "Explore our curated selection of quality pre-owned vehicles from verified local sellers.",
                  color: "bg-blue-500",
                },
                {
                  icon: Calendar,
                  title: "Attend an Event",
                  description:
                    "Meet sellers in person at our monthly popup events. Test drive and inspect vehicles firsthand.",
                  color: "bg-emerald-500",
                },
                {
                  icon: CheckCircle2,
                  title: "Complete Your Purchase",
                  description:
                    "Finalize the deal directly with the seller. Simple, transparent, and hassle-free.",
                  color: "bg-violet-500",
                },
              ].map((step, index) => (
                <div className="group relative" key={step.title}>
                  <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
                    {/* Step Number */}
                    <div className="-top-4 absolute left-8 flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white font-bold text-gray-400 text-sm shadow-md">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${step.color} text-white shadow-lg`}
                    >
                      <step.icon className="h-7 w-7" />
                    </div>

                    <h3 className="mb-3 font-semibold text-gray-900 text-xl">
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

        {/* Why Gearboxe Section */}
        <section className="relative overflow-hidden border-gray-100 border-y bg-gradient-to-b from-primary/5 via-white to-white py-20 lg:py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 font-medium text-primary text-sm">
                <Zap className="h-4 w-4" />
                Why Gearboxe?
              </div>
              <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">
                The Car Marketplace Built Different
              </h2>
              <p className="mx-auto max-w-2xl text-gray-600 text-lg">
                Gearboxe isn't just another listing site. We bring buyers and
                sellers together through a trusted, community-driven
                marketplace.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Shield,
                  title: "Verified Sellers",
                  description:
                    "Every seller is vetted. No scams, no surprises — just real people selling real cars.",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  icon: Eye,
                  title: "See Before You Buy",
                  description:
                    "Attend in-person events to inspect and test drive vehicles before making a decision.",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  icon: MessageCircle,
                  title: "Direct Communication",
                  description:
                    "Message sellers directly through Gearboxe. No middlemen, no dealer markups.",
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
                {
                  icon: Heart,
                  title: "Community First",
                  description:
                    "Join a growing community of car enthusiasts who value transparency and fair deals.",
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                },
              ].map((item) => (
                <div
                  className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
                  key={item.title}
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button
                asChild
                className="group shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
                size="lg"
              >
                <Link className="flex items-center gap-2" href="/vehicles">
                  <Search className="h-5 w-5" />
                  Start Browsing on Gearboxe
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Next Event Section */}
        {nextEvent && (
          <section className="border-gray-100 border-y bg-white py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 font-medium text-primary text-sm">
                    <Calendar className="h-4 w-4" />
                    Don't Miss Out
                  </div>
                  <h2 className="font-bold text-3xl text-gray-900 sm:text-4xl">
                    Next Upcoming Event
                  </h2>
                </div>
                <Button asChild className="group" variant="outline">
                  <Link className="flex items-center gap-2" href="/events">
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
                <div className="mb-2 inline-flex items-center gap-2 font-medium text-primary text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Featured Selection
                </div>
                <h2 className="font-bold text-3xl text-gray-900 sm:text-4xl">
                  Popular Vehicles
                </h2>
              </div>
              <Button asChild className="group" variant="outline">
                <Link className="flex items-center gap-2" href="/vehicles">
                  View All Vehicles
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {(featuredVehicles === undefined ||
              featuredVehicles.vehicles === undefined) && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
                  <div
                    className="animate-pulse rounded-xl border border-gray-100 bg-white p-4"
                    key={key}
                  >
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
            )}
            {featuredVehicles?.vehicles !== undefined &&
              displayVehicles.length > 0 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle._id} vehicle={vehicle} />
                  ))}
                </div>
              )}
            {featuredVehicles?.vehicles !== undefined &&
              displayVehicles.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Car className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-3 font-semibold text-gray-900 text-xl">
                    No vehicles available yet
                  </h3>
                  <p className="mx-auto mb-8 max-w-md text-gray-600">
                    We're working on bringing you amazing vehicles from our
                    community. Check back soon!
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                      <Link className="flex items-center gap-2" href="/events">
                        <Calendar className="h-4 w-4" />
                        Attend Next Event
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link
                        className="flex items-center gap-2"
                        href="/myAccount/new-listing"
                      >
                        <Car className="h-4 w-4" />
                        List Your Vehicle
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* Marketplace Teaser Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary/90 py-16">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="-top-20 -left-20 absolute h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="-bottom-20 -right-20 absolute h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <h2 className="mb-3 font-bold text-2xl text-white sm:text-3xl md:text-4xl">
                  Hundreds of Vehicles. One Marketplace.
                </h2>
                <p className="max-w-xl text-lg text-white/80">
                  New listings added every week. Don't miss out on your perfect
                  car — explore the full Gearboxe marketplace now.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="group whitespace-nowrap shadow-xl"
                  size="lg"
                  variant="secondary"
                >
                  <Link className="flex items-center gap-2" href="/vehicles">
                    <Globe className="h-5 w-5" />
                    Browse All Listings
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button
                    asChild
                    className="whitespace-nowrap border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white active:bg-white/25"
                    size="lg"
                    variant="outline"
                  >
                    <Link className="flex items-center gap-2" href="/sign-up">
                      <Users className="h-5 w-5" />
                      Sign Up Free
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Gearboxe App Promotion */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              <div className="grid items-center gap-0 lg:grid-cols-2">
                {/* Left Content */}
                <div className="p-8 sm:p-12 lg:p-16">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 font-medium text-primary text-sm">
                    <Wrench className="h-4 w-4" />
                    Powered by Gearboxe
                  </div>
                  <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">
                    Found Your Car?
                    <span className="text-gradient-primary">
                      {" "}
                      Now Maintain It.
                    </span>
                  </h2>
                  <p className="mb-8 max-w-md text-gray-600 text-lg leading-relaxed">
                    Gearboxe Market is part of the Gearboxe ecosystem. Once you
                    buy your car, use{" "}
                    <a
                      className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
                      href="https://gearboxe.com"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Gearboxe.com
                    </a>{" "}
                    to track maintenance, get service reminders, and keep your
                    vehicle running like new.
                  </p>

                  <div className="mb-8 space-y-4">
                    {[
                      {
                        icon: Wrench,
                        text: "Track maintenance history and service records",
                      },
                      {
                        icon: Zap,
                        text: "Smart reminders for oil changes, tires, and more",
                      },
                      {
                        icon: Shield,
                        text: "Keep your car's value with documented upkeep",
                      },
                      {
                        icon: Smartphone,
                        text: "Manage everything from the Gearboxe app",
                      },
                    ].map((feature) => (
                      <div
                        className="flex items-center gap-3"
                        key={feature.text}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <feature.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-gray-700 text-sm">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Gearboxe.com Link */}
                  <div className="mb-6">
                    <Button
                      asChild
                      className="group shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
                      size="lg"
                    >
                      <a
                        className="flex items-center gap-2"
                        href="https://gearboxe.com"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Globe className="h-5 w-5" />
                        Go to Gearboxe.com
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>

                  {/* App Store Badges */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      className="group inline-flex items-center gap-3 rounded-xl border border-gray-900 bg-gray-900 px-5 py-3 transition-all hover:bg-gray-800"
                      href="https://apps.apple.com"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <svg
                        className="h-8 w-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <title>Apple</title>
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 leading-none">
                          Download on the
                        </p>
                        <p className="font-semibold text-base text-white leading-tight">
                          App Store
                        </p>
                      </div>
                    </a>
                    <a
                      className="group inline-flex items-center gap-3 rounded-xl border border-gray-900 bg-gray-900 px-5 py-3 transition-all hover:bg-gray-800"
                      href="https://play.google.com"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Play className="h-7 w-7 fill-white text-white" />
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 leading-none">
                          GET IT ON
                        </p>
                        <p className="font-semibold text-base text-white leading-tight">
                          Google Play
                        </p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Right Visual — Enhanced Phone Mockup */}
                <div className="relative hidden bg-gradient-to-br from-primary/5 to-primary/10 p-12 lg:block">
                  <div className="relative mx-auto max-w-sm">
                    {/* Phone mockup */}
                    <div className="relative mx-auto w-64 rounded-[2.5rem] border-4 border-gray-900 bg-gray-900 p-2 shadow-2xl">
                      {/* Notch */}
                      <div className="absolute top-0 right-0 left-0 z-10 flex justify-center">
                        <div className="h-6 w-28 rounded-b-2xl bg-gray-900" />
                      </div>
                      <div className="overflow-hidden rounded-[2rem] bg-white">
                        {/* Status bar */}
                        <div className="flex items-center justify-between bg-primary px-4 pt-8 pb-3">
                          <div>
                            <p className="font-bold text-white text-xs">
                              Gearboxe
                            </p>
                            <p className="text-[9px] text-white/60">
                              My Garage
                            </p>
                          </div>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                            <Bell className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>

                        <div className="space-y-2.5 p-3.5">
                          {/* Vehicle card */}
                          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Car className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-[11px] text-gray-900">
                                  2024 BMW M4
                                </p>
                                <p className="text-[9px] text-gray-500">
                                  32,150 miles
                                </p>
                              </div>
                              <div className="rounded-full bg-emerald-100 px-2 py-0.5">
                                <span className="font-semibold text-[8px] text-emerald-700">
                                  Healthy
                                </span>
                              </div>
                            </div>
                            {/* Health bar */}
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                            </div>
                          </div>

                          {/* Upcoming service */}
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Zap className="h-3 w-3 text-amber-500" />
                                <span className="font-bold text-[10px] text-amber-800">
                                  Next Service
                                </span>
                              </div>
                              <span className="font-semibold text-[9px] text-amber-600">
                                In 12 days
                              </span>
                            </div>
                            <p className="text-[9px] text-amber-700">
                              Oil change + tire rotation
                            </p>
                            <div className="mt-2 flex gap-1.5">
                              <div className="flex-1 rounded-md bg-amber-600 py-1 text-center">
                                <span className="font-semibold text-[8px] text-white">
                                  Schedule Now
                                </span>
                              </div>
                              <div className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-center">
                                <span className="font-semibold text-[8px] text-amber-700">
                                  Dismiss
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Maintenance log */}
                          <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center gap-1.5">
                              <ClipboardList className="h-3 w-3 text-gray-400" />
                              <span className="font-bold text-[10px] text-gray-700">
                                Recent Activity
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-[9px] text-gray-800">
                                    Brake pads replaced
                                  </p>
                                  <p className="text-[8px] text-gray-400">
                                    Feb 3, 2026
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
                                  <CircleGauge className="h-3 w-3 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-[9px] text-gray-800">
                                    Oil change completed
                                  </p>
                                  <p className="text-[8px] text-gray-400">
                                    Jan 18, 2026
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100">
                                  <Wrench className="h-3 w-3 text-violet-500" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-[9px] text-gray-800">
                                    Tire rotation
                                  </p>
                                  <p className="text-[8px] text-gray-400">
                                    Jan 5, 2026
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom nav bar */}
                        <div className="flex items-center justify-around border-gray-100 border-t px-2 py-2">
                          <div className="flex flex-col items-center gap-0.5">
                            <Car className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-[7px] text-primary">
                              Garage
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <Wrench className="h-4 w-4 text-gray-300" />
                            <span className="text-[7px] text-gray-400">
                              Service
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <ClipboardList className="h-4 w-4 text-gray-300" />
                            <span className="text-[7px] text-gray-400">
                              History
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <Users className="h-4 w-4 text-gray-300" />
                            <span className="text-[7px] text-gray-400">
                              Profile
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating badges */}
                    <div className="-left-8 absolute top-20 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            Oil Changed
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Logged in Gearboxe
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="-right-8 absolute bottom-28 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                          <Bell className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">
                            Tire Rotation
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Due in 500 miles
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium text-sm text-white">
                <Sparkles className="h-4 w-4" />
                Join the Gearboxe Community
              </div>

              <h2 className="mb-6 font-bold text-3xl text-white sm:text-4xl md:text-5xl">
                Ready to Buy or Sell on Gearboxe?
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-gray-300 text-lg leading-relaxed">
                Whether you're hunting for your next car or looking to sell,
                Gearboxe is the marketplace that brings it all together. Join
                thousands of members today.
              </p>

              <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  className="group shadow-xl"
                  size="lg"
                  variant="secondary"
                >
                  <Link className="flex items-center gap-2" href="/vehicles">
                    <Search className="h-5 w-5" />
                    Explore the Marketplace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {isAuthenticated ? (
                  <Button
                    asChild
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white active:bg-white/15"
                    size="lg"
                    variant="outline"
                  >
                    <Link
                      className="flex items-center gap-2"
                      href="/myAccount/new-listing"
                    >
                      <Car className="h-5 w-5" />
                      List Your Car
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white active:bg-white/15"
                    size="lg"
                    variant="outline"
                  >
                    <Link className="flex items-center gap-2" href="/sign-up">
                      <Users className="h-5 w-5" />
                      Get Started Free
                    </Link>
                  </Button>
                )}
              </div>

              {/* Benefits Grid */}
              <div className="grid gap-6 sm:grid-cols-4">
                {[
                  {
                    icon: Search,
                    title: "Browse Instantly",
                    description: "Explore hundreds of curated listings",
                  },
                  {
                    icon: Users,
                    title: "Direct Access",
                    description: "Connect with sellers, no middlemen",
                  },
                  {
                    icon: Calendar,
                    title: "Monthly Events",
                    description: "See cars in person before buying",
                  },
                  {
                    icon: Shield,
                    title: "Verified Community",
                    description: "Trusted buyers and sellers only",
                  },
                ].map((benefit) => (
                  <div
                    className="rounded-xl bg-white/5 p-6 backdrop-blur-sm"
                    key={benefit.title}
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
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
