"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Input } from "@gearboxe-market/ui/input";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, Save, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

const BIO_MAX_LENGTH = 500;

export default function EditProfilePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser } = useUser();
  const { toast } = useToast();

  const currentUser = useQuery(
    api.users.getUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const updateProfile = useMutation(api.users.updateProfile);

  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (currentUser && !initialized) {
      setBio(currentUser.bio || "");
      setPhone(currentUser.phone || "");
      setLocation(currentUser.location || "");
      setInitialized(true);
    }
  }, [currentUser, initialized]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50/50">
        <Navbar />
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 p-8">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-full bg-gray-200" />
                <div className="space-y-3">
                  <div className="h-6 w-40 rounded-lg bg-gray-200" />
                  <div className="h-4 w-56 rounded-lg bg-gray-200/70" />
                </div>
              </div>
            </div>
            {/* Form skeleton */}
            <div className="space-y-6 rounded-2xl border border-gray-200/60 bg-white p-8">
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-11 rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 rounded bg-gray-200" />
                <div className="h-11 rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 rounded bg-gray-200" />
                <div className="h-28 rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-200" />
                <div className="h-11 rounded-lg bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-11 rounded-lg bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        bio: bio || undefined,
        phone: phone || undefined,
        location: location || undefined,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = clerkUser?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Back link */}
        <Link
          href="/myAccount"
          className="mb-6 inline-flex items-center gap-1.5 text-gray-500 text-sm transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        {/* Profile header */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-sm">
          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-center gap-5">
              {clerkUser?.imageUrl ? (
                <img
                  alt={clerkUser.fullName || "User"}
                  className="h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg"
                  src={clerkUser.imageUrl}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br from-primary to-primary-700 shadow-lg">
                  <span className="font-semibold text-2xl text-white">
                    {initials || "U"}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-bold text-2xl text-white">
                  {clerkUser?.fullName || "User"}
                </h1>
                <p className="mt-1 truncate text-slate-300 text-sm">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              {currentUser?._id && (
                <Link
                  href={`/profile/${currentUser._id}`}
                  className="hidden items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:inline-flex"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Public Profile
                </Link>
              )}
            </div>
            {currentUser?._id && (
              <Link
                href={`/profile/${currentUser._id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 font-medium text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:hidden"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Public Profile
              </Link>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8 rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm sm:p-8">
          {/* Account Info Section */}
          <div>
            <h2 className="mb-1 font-semibold text-base text-gray-900">
              Account Information
            </h2>
            <p className="mb-5 text-gray-500 text-sm">
              These fields are managed by your authentication provider and cannot be changed here.
            </p>
            <div className="space-y-4">
              {/* Name (read-only) */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Name
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-gray-600">
                    {clerkUser?.fullName || "User"}
                  </span>
                  <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-400 text-xs">
                    Read-only
                  </span>
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="mb-1.5 block font-medium text-gray-700 text-sm">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate text-gray-600">
                    {clerkUser?.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                  <span className="ml-auto shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-400 text-xs">
                    Read-only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-gray-100 border-t" />

          {/* Profile Details Section */}
          <div>
            <h2 className="mb-1 font-semibold text-base text-gray-900">
              Profile Details
            </h2>
            <p className="mb-5 text-gray-500 text-sm">
              This information will be visible on your public profile.
            </p>
            <div className="space-y-5">
              {/* Bio */}
              <div>
                <label
                  className="mb-1.5 block font-medium text-gray-700 text-sm"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  id="bio"
                  maxLength={BIO_MAX_LENGTH}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself, your interests, or what you're looking for..."
                  rows={4}
                  value={bio}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-gray-400 text-xs">
                    This will be visible on your public profile
                  </p>
                  <span
                    className={`text-xs ${
                      bio.length > BIO_MAX_LENGTH * 0.9
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  >
                    {bio.length}/{BIO_MAX_LENGTH}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  className="mb-1.5 block font-medium text-gray-700 text-sm"
                  htmlFor="phone"
                >
                  Phone
                </label>
                <div className="relative">
                  <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    id="phone"
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={phone}
                  />
                </div>
                <p className="mt-1.5 text-gray-400 text-xs">
                  Optional. Allows buyers to contact you directly.
                </p>
              </div>

              {/* Location */}
              <div>
                <label
                  className="mb-1.5 block font-medium text-gray-700 text-sm"
                  htmlFor="location"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    id="location"
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    value={location}
                  />
                </div>
                <p className="mt-1.5 text-gray-400 text-xs">
                  Helps buyers find vehicles near them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 sticky bottom-0 z-10 mt-6 border-gray-200/80 border-t bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/myAccount"
              className="font-medium text-gray-500 text-sm transition-colors hover:text-gray-900"
            >
              Cancel
            </Link>
            <Button disabled={isSaving} onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
