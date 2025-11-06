"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { Input } from "@car-market/ui/input";
import { Label } from "@car-market/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@car-market/ui/select";
import { Textarea } from "@car-market/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { notFound, redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Footer } from "../../../../../components/footer";
import { Navbar } from "../../../../../components/navbar";

const makes = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, user: currentUser } = useCurrentUser();
  const { user } = useUser();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    vin: "",
    description: "",
    contactInfo: "",
    photos: [] as string[],
    eventId: "",
  });

  // Resolve params
  useEffect(() => {
    params.then((resolved) => setVehicleId(resolved.id));
  }, [params]);

  const vehicle = useQuery(
    api.vehicles.getVehicleById,
    vehicleId ? { id: vehicleId as any } : "skip"
  );

  const upcomingEvents = useQuery(api.events.getUpcomingEvents);
  const updateVehicle = useMutation(api.vehicles.updateVehicle);

  // Load vehicle data into form
  useEffect(() => {
    if (vehicle) {
      setFormData({
        title: vehicle.title || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        mileage: vehicle.mileage?.toString() || "",
        price: vehicle.price?.toString() || "",
        vin: vehicle.vin || "",
        description: vehicle.description || "",
        contactInfo: vehicle.contactInfo || "",
        photos: vehicle.photos || [],
        eventId: vehicle.eventId || "",
      });
    }
  }, [vehicle]);

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

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (vehicle === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (!vehicle || vehicle.userId !== currentUser._id) {
    notFound();
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you'd upload to Convex file storage
      // For now, we'll simulate with placeholder URLs
      const newPhotos = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!vehicleId) return;

    setIsSubmitting(true);
    try {
      await updateVehicle({
        id: vehicleId as any,
        title: formData.title,
        make: formData.make,
        model: formData.model,
        year: Number.parseInt(formData.year),
        mileage: Number.parseInt(formData.mileage),
        price: Number.parseFloat(formData.price),
        vin: formData.vin || undefined,
        photos: formData.photos,
        description: formData.description,
        contactInfo: formData.contactInfo,
        eventId: formData.eventId ? (formData.eventId as any) : undefined,
      });

      router.push(`/myAccount/my-listings?updated=${vehicleId}`);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.make &&
    formData.model &&
    formData.year &&
    formData.mileage &&
    formData.price &&
    formData.description &&
    formData.contactInfo &&
    formData.eventId;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/myAccount/my-listings"
            className="mb-4 inline-flex items-center text-gray-600 text-sm hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Listings
          </Link>
          <h1 className="font-bold text-3xl text-gray-900">Edit Listing</h1>
          <p className="text-gray-600">
            Update your vehicle listing information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., 2020 Honda Civic - Excellent Condition"
                  value={formData.title}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Select
                  onValueChange={(value) => handleInputChange("make", value)}
                  value={formData.make}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="e.g., Civic"
                  value={formData.model}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  onValueChange={(value) => handleInputChange("year", value)}
                  value={formData.year}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage *</Label>
                <Input
                  id="mileage"
                  onChange={(e) =>
                    handleInputChange("mileage", e.target.value)
                  }
                  placeholder="e.g., 50000"
                  type="number"
                  value={formData.mileage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g., 25000"
                  type="number"
                  value={formData.price}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input
                  id="vin"
                  onChange={(e) => handleInputChange("vin", e.target.value)}
                  placeholder="17-character VIN"
                  value={formData.vin}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your vehicle's condition, features, and any important details..."
                rows={6}
                value={formData.description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input
                id="contactInfo"
                onChange={(e) =>
                  handleInputChange("contactInfo", e.target.value)
                }
                placeholder="e.g., Phone: (555) 123-4567, Email: seller@example.com"
                value={formData.contactInfo}
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="rounded-lg border-2 border-gray-300 border-dashed p-6 text-center">
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-4 text-gray-600">
                  Upload photos of your vehicle
                </p>
                <input
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  multiple
                  onChange={handlePhotoUpload}
                  type="file"
                />
                <Button asChild variant="outline">
                  <label className="cursor-pointer" htmlFor="photo-upload">
                    Choose Photos
                  </label>
                </Button>
              </div>

              {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {formData.photos.map((photo, index) => (
                    <div className="relative" key={index}>
                      <img
                        alt={`Vehicle photo ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                        src={photo}
                      />
                      <button
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        onClick={() => handleRemovePhoto(index)}
                        type="button"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M6 18L18 6M6 6l12 12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input
                id="contactInfo"
                onChange={(e) =>
                  handleInputChange("contactInfo", e.target.value)
                }
                placeholder="e.g., Phone: (555) 123-4567, Email: seller@example.com"
                value={formData.contactInfo}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Associated Event *</Label>
              <Select
                onValueChange={(value) => handleInputChange("eventId", value)}
                value={formData.eventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an upcoming event" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <SelectItem key={event._id} value={event._id}>
                        {event.name} -{" "}
                        {new Date(event.date).toLocaleDateString()}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="no-events">
                      No upcoming events available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {upcomingEvents && upcomingEvents.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Please contact an administrator to create an upcoming event.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                asChild
                onClick={() => router.back()}
                variant="outline"
              >
                <Link href="/myAccount/my-listings">Cancel</Link>
              </Button>
              <Button
                disabled={!isFormValid || !formData.eventId || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Updating..." : "Update Listing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

