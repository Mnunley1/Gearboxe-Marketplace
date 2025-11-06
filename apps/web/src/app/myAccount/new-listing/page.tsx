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
import { Car, Upload } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

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

export default function NewListingPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user: currentUser } = useCurrentUser();
  const { user } = useUser();

  const [step, setStep] = useState(1);
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

  // Always call hooks to maintain hook order
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);
  const createVehicle = useMutation(api.vehicles.createVehicle);

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

  const handleSubmit = async () => {
    if (!currentUser || !formData.eventId) return;

    setIsSubmitting(true);
    try {
      const vehicleId = await createVehicle({
        userId: currentUser._id,
        eventId: formData.eventId as any,
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
      });

      router.push(`/myAccount/my-listings?created=${vehicleId}`);
    } catch (error) {
      console.error("Error creating vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid =
    formData.title &&
    formData.make &&
    formData.model &&
    formData.year &&
    formData.mileage &&
    formData.price;
  const isStep2Valid = formData.description && formData.contactInfo;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900">
            List Your Vehicle
          </h1>
          <p className="text-gray-600">
            Create a new vehicle listing to showcase at our events
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${step >= 1 ? "text-primary" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                  step >= 1
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="font-medium text-sm">Vehicle Details</span>
            </div>
            <div className="h-px flex-1 bg-gray-200" />
            <div
              className={`flex items-center space-x-2 ${step >= 2 ? "text-primary" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                  step >= 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="font-medium text-sm">Description & Photos</span>
            </div>
            <div className="h-px flex-1 bg-gray-200" />
            <div
              className={`flex items-center space-x-2 ${step >= 3 ? "text-primary" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                  step >= 3
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="font-medium text-sm">Event Registration</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {step}:{" "}
              {step === 1
                ? "Vehicle Information"
                : step === 2
                  ? "Description & Photos"
                  : "Event Registration"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Listing Title *</Label>
                    <Input
                      id="title"
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., 2020 Honda Civic - Excellent Condition"
                      value={formData.title}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("make", value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                      placeholder="e.g., Civic"
                      value={formData.model}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("year", value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
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

                <div className="flex justify-end">
                  <Button disabled={!isStep1Valid} onClick={() => setStep(2)}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button onClick={() => setStep(1)} variant="outline">
                    Previous Step
                  </Button>
                  <Button disabled={!isStep2Valid} onClick={() => setStep(3)}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="event">Select Event *</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("eventId", value)
                    }
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
                      Please contact an administrator to create an upcoming
                      event before listing your vehicle.
                    </p>
                  )}
                </div>

                <div className="py-8 text-center">
                  <Car className="mx-auto mb-4 h-16 w-16 text-primary" />
                  <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                    Ready to Submit?
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Your vehicle listing will be reviewed by our team before
                    being published. Your vehicle will be associated with the
                    selected event.
                  </p>

                  <div className="mb-6 rounded-lg bg-gray-50 p-6">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Listing Summary
                    </h4>
                    <div className="space-y-1 text-gray-600 text-sm">
                      <p>
                        <strong>Title:</strong> {formData.title}
                      </p>
                      <p>
                        <strong>Vehicle:</strong> {formData.year}{" "}
                        {formData.make} {formData.model}
                      </p>
                      <p>
                        <strong>Mileage:</strong> {formData.mileage} miles
                      </p>
                      <p>
                        <strong>Price:</strong> ${formData.price}
                      </p>
                      <p>
                        <strong>Photos:</strong> {formData.photos.length}{" "}
                        uploaded
                      </p>
                      {formData.eventId && upcomingEvents && (
                        <p>
                          <strong>Event:</strong>{" "}
                          {
                            upcomingEvents.find(
                              (e) => e._id === formData.eventId
                            )?.name
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button onClick={() => setStep(2)} variant="outline">
                      Previous Step
                    </Button>
                    <Button
                      disabled={isSubmitting || !formData.eventId}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "Creating Listing..." : "Create Listing"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
