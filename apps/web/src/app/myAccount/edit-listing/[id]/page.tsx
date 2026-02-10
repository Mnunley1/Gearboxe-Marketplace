"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";
import { Input } from "@gearboxe-market/ui/input";
import { Label } from "@gearboxe-market/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gearboxe-market/ui/select";
import { Textarea } from "@gearboxe-market/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../../components/footer";
import { Navbar } from "../../../../../components/navbar";
import { ImageUpload } from "../../../../../components/image-upload";

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
  const { toast } = useToast();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Listing title is required";
    }
    if (!formData.make) {
      newErrors.make = "Make is required";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }
    if (formData.year) {
      const yearNum = Number.parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        newErrors.year = "Please enter a valid year";
      }
    } else {
      newErrors.year = "Year is required";
    }
    if (formData.mileage.trim()) {
      const mileageNum = Number.parseInt(formData.mileage);
      if (isNaN(mileageNum) || mileageNum < 0) {
        newErrors.mileage = "Please enter a valid mileage";
      }
    } else {
      newErrors.mileage = "Mileage is required";
    }
    if (formData.price.trim()) {
      const priceNum = Number.parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Please enter a valid price";
      }
    } else {
      newErrors.price = "Price is required";
    }
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be exactly 17 characters";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = "Contact information is required";
    }
    if (!formData.eventId) {
      newErrors.eventId = "Please select an event";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!vehicleId) return;

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await updateVehicle({
        id: vehicleId as any,
        title: formData.title.trim(),
        make: formData.make,
        model: formData.model.trim(),
        year: Number.parseInt(formData.year),
        mileage: Number.parseInt(formData.mileage),
        price: Number.parseFloat(formData.price),
        vin: formData.vin || undefined,
        photos: formData.photos,
        description: formData.description.trim(),
        contactInfo: formData.contactInfo.trim(),
        eventId: formData.eventId ? (formData.eventId as any) : undefined,
      });

      toast({
        title: "Listing Updated",
        description: "Your vehicle listing has been updated successfully.",
      });

      router.push(`/myAccount/my-listings?updated=${vehicleId}`);
    } catch (error: any) {
      console.error("Error updating vehicle:", error);
      const errorMessage =
        error?.message || "Failed to update listing. Please try again.";
      toast({
        title: "Error Updating Listing",
        description: errorMessage,
        variant: "destructive",
      });
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
                  onChange={(e) => {
                    handleInputChange("title", e.target.value);
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                  placeholder="e.g., 2020 Honda Civic - Excellent Condition"
                  value={formData.title}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Select
                  onValueChange={(value) => {
                    handleInputChange("make", value);
                    if (errors.make) {
                      setErrors((prev) => ({ ...prev, make: "" }));
                    }
                  }}
                  value={formData.make}
                >
                  <SelectTrigger className={errors.make ? "border-red-500" : ""}>
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
                {errors.make && (
                  <p className="text-red-600 text-sm">{errors.make}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  onChange={(e) => {
                    handleInputChange("model", e.target.value);
                    if (errors.model) {
                      setErrors((prev) => ({ ...prev, model: "" }));
                    }
                  }}
                  placeholder="e.g., Civic"
                  value={formData.model}
                  className={errors.model ? "border-red-500" : ""}
                />
                {errors.model && (
                  <p className="text-red-600 text-sm">{errors.model}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  onValueChange={(value) => {
                    handleInputChange("year", value);
                    if (errors.year) {
                      setErrors((prev) => ({ ...prev, year: "" }));
                    }
                  }}
                  value={formData.year}
                >
                  <SelectTrigger className={errors.year ? "border-red-500" : ""}>
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
                {errors.year && (
                  <p className="text-red-600 text-sm">{errors.year}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage *</Label>
                <Input
                  id="mileage"
                  onChange={(e) => {
                    handleInputChange("mileage", e.target.value);
                    if (errors.mileage) {
                      setErrors((prev) => ({ ...prev, mileage: "" }));
                    }
                  }}
                  placeholder="e.g., 50000"
                  type="number"
                  value={formData.mileage}
                  className={errors.mileage ? "border-red-500" : ""}
                />
                {errors.mileage && (
                  <p className="text-red-600 text-sm">{errors.mileage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  onChange={(e) => {
                    handleInputChange("price", e.target.value);
                    if (errors.price) {
                      setErrors((prev) => ({ ...prev, price: "" }));
                    }
                  }}
                  placeholder="e.g., 25000"
                  type="number"
                  value={formData.price}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Optional)</Label>
                <Input
                  id="vin"
                  onChange={(e) => {
                    handleInputChange("vin", e.target.value);
                    if (errors.vin) {
                      setErrors((prev) => ({ ...prev, vin: "" }));
                    }
                  }}
                  placeholder="17-character VIN"
                  value={formData.vin}
                  className={errors.vin ? "border-red-500" : ""}
                  maxLength={17}
                />
                {errors.vin && (
                  <p className="text-red-600 text-sm">{errors.vin}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                onChange={(e) => {
                  handleInputChange("description", e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }
                }}
                placeholder="Describe your vehicle's condition, features, and any important details..."
                rows={6}
                value={formData.description}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-600 text-sm">{errors.description}</p>
              )}
              {!errors.description && formData.description && (
                <p className="text-gray-500 text-sm">
                  {formData.description.length}/50 characters minimum
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <Input
                id="contactInfo"
                onChange={(e) => {
                  handleInputChange("contactInfo", e.target.value);
                  if (errors.contactInfo) {
                    setErrors((prev) => ({ ...prev, contactInfo: "" }));
                  }
                }}
                placeholder="e.g., Phone: (555) 123-4567, Email: seller@example.com"
                value={formData.contactInfo}
                className={errors.contactInfo ? "border-red-500" : ""}
              />
              {errors.contactInfo && (
                <p className="text-red-600 text-sm">{errors.contactInfo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <ImageUpload
                maxImages={10}
                onChange={(keys) => {
                  setFormData((prev) => ({ ...prev, photos: keys }));
                }}
                value={formData.photos}
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
              <Label htmlFor="event">Associated Event *</Label>
              <Select
                onValueChange={(value) => {
                  handleInputChange("eventId", value);
                  if (errors.eventId) {
                    setErrors((prev) => ({ ...prev, eventId: "" }));
                  }
                }}
                value={formData.eventId}
              >
                <SelectTrigger className={errors.eventId ? "border-red-500" : ""}>
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
              {errors.eventId && (
                <p className="text-red-600 text-sm">{errors.eventId}</p>
              )}
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
                disabled={!(isFormValid && formData.eventId ) || isSubmitting}
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

