"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { useQuery } from "convex/react";
import {
  Calendar,
  Car,
  ChevronRight,
  Edit,
  MapPin,
  Quote,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";
import { VehicleCard } from "../../../../components/vehicle-card";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const { user: currentUser } = useCurrentUser();

  const profile = useQuery(api.users.getPublicProfile, {
    userId: userId as any,
  });

  const allVehicles = useQuery(api.vehicles.getVehicles, {
    status: "approved",
  });

  const userVehicles = allVehicles?.vehicles?.filter(
    (v: any) => v.userId === userId
  );

  const isOwnProfile = currentUser?._id === userId;

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50/50">
        <Navbar />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 h-4 w-40 rounded bg-gray-200" />
            {/* Banner skeleton */}
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white">
              <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100" />
              <div className="px-8 pb-8">
                <div className="-mt-12 flex items-end gap-6">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200" />
                  <div className="mb-1 flex-1 space-y-2">
                    <div className="h-7 w-48 rounded-lg bg-gray-200" />
                    <div className="h-4 w-64 rounded-lg bg-gray-100" />
                  </div>
                </div>
                <div className="mt-6 flex gap-6">
                  <div className="h-5 w-28 rounded bg-gray-100" />
                  <div className="h-5 w-36 rounded bg-gray-100" />
                  <div className="h-5 w-24 rounded bg-gray-100" />
                </div>
                <div className="mt-6 h-20 rounded-xl bg-gray-50" />
              </div>
            </div>
            {/* Grid skeleton */}
            <div className="mt-10">
              <div className="mb-6 h-6 w-28 rounded bg-gray-200" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    className="h-72 rounded-xl border border-gray-100 bg-white"
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return notFound();
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const vehicleCount = userVehicles?.length ?? profile.vehicleCount ?? 0;
  const hasListings = vehicleCount > 0;

  const initials = profile.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-gray-500 text-sm">
          <Link href="/" className="transition-colors hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900">{profile.name}</span>
        </nav>

        {/* Profile Header */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 sm:h-36">
            <div className="absolute inset-0 opacity-10">
              <svg
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <div className="px-6 pb-8 sm:px-8">
            {/* Avatar + Edit */}
            <div className="flex items-end justify-between">
              <div className="-mt-12 sm:-mt-14">
                {profile.profileImageUrl ? (
                  <img
                    alt={profile.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                    src={profile.profileImageUrl}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-primary-700 shadow-lg sm:h-28 sm:w-28">
                    <span className="font-bold text-3xl text-white sm:text-4xl">
                      {initials || "U"}
                    </span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/myAccount/profile">
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Name + badge */}
            <div className="mt-4">
              <div className="flex items-center gap-2.5">
                <h1 className="font-bold text-2xl text-gray-900 sm:text-3xl">
                  {profile.name}
                </h1>
                {hasListings && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Seller
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-500 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Member since {memberSince}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span>
                    {vehicleCount}{" "}
                    {vehicleCount === 1 ? "listing" : "listings"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <Quote className="mb-2 h-5 w-5 text-gray-300" />
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicles */}
        <div>
          <h2 className="mb-6 font-semibold text-gray-900 text-xl">
            Listings
          </h2>
          {userVehicles && userVehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userVehicles.map((vehicle: any) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  showFavorite
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-300 border-dashed bg-white py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Car className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900">No listings yet</h3>
              <p className="mt-1 text-gray-500 text-sm">
                This seller hasn&apos;t posted any vehicles.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
