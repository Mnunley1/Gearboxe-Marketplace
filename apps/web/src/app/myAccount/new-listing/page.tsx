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
import { Car } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";
import { ImageUpload } from "../../../../components/image-upload";
import { Id } from "@car-market/convex/_generated/dataModel";

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
  const { toast } = useToast();

  const [step, setStep] = useState(1);
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
  const createPendingRegistration = useMutation(api.registrations.createPendingRegistration);

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
    if (!formData.year) {
      newErrors.year = "Year is required";
    } else {
      const yearNum = Number.parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        newErrors.year = "Please enter a valid year";
      }
    }
    if (!formData.mileage.trim()) {
      newErrors.mileage = "Mileage is required";
    } else {
      const mileageNum = Number.parseInt(formData.mileage);
      if (isNaN(mileageNum) || mileageNum < 0) {
        newErrors.mileage = "Please enter a valid mileage";
      }
    }
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const priceNum = Number.parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Please enter a valid price";
      }
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
    } else {
      // Check if selected event is full
      const selectedEvent = upcomingEvents?.find((e) => e._id === formData.eventId);
      if (selectedEvent?.isFull) {
        newErrors.eventId = "This event is full. Please select a different event.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentUser || !formData.eventId) return;

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check capacity BEFORE creating vehicle
    const event = upcomingEvents?.find((e) => e._id === formData.eventId);
    if (event && event.isFull) {
      toast({
        title: "Event is Full",
        description: "This event has reached its capacity. Please select a different event.",
        variant: "destructive",
      });
      setErrors((prev) => ({ ...prev, eventId: "This event is full" }));
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      // Create vehicle first
      const vehicleId = await createVehicle({
        userId: currentUser._id,
        eventId: formData.eventId as any,
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
      });

      // Get event to check if payment is required
      if (event && event.vendorPrice > 0) {
        // Create pending registration (will also check capacity as final validation)
        const registrationId = await createPendingRegistration({
          eventId: formData.eventId as any,
          vehicleId: vehicleId as any,
          userId: currentUser._id,
        });

        // Redirect to payment page
        router.push(`/myAccount/payment?registrationId=${registrationId}&vehicleId=${vehicleId}&eventId=${formData.eventId}`);
      } else {
        // No payment required, redirect to listings
        toast({
          title: "Listing Created",
          description: "Your vehicle listing has been created successfully and is pending review.",
        });
        router.push(`/myAccount/my-listings?created=${vehicleId}`);
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      const errorMessage =
        error?.message || "Failed to create listing. Please try again.";
      
      // Handle specific error messages
      if (errorMessage.includes("full") || errorMessage.includes("capacity")) {
        setErrors((prev) => ({ ...prev, eventId: "This event is now full" }));
        toast({
          title: "Event is Full",
          description: "This event has reached its capacity. Please select a different event.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error Creating Listing",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
                        upcomingEvents.map((event) => {
                          const isFull = event.isFull ?? false;
                          const available = event.available ?? 0;
                          return (
                            <SelectItem
                              key={event._id}
                              value={event._id}
                              disabled={isFull}
                            >
                              {event.name} - {new Date(event.date).toLocaleDateString()}
                              {isFull ? " (Full)" : ` (${available} spot${available !== 1 ? "s" : ""} available)`}
                            </SelectItem>
                          );
                        })
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
                  {formData.eventId && upcomingEvents && (
                    (() => {
                      const selectedEvent = upcomingEvents.find(
                        (e) => e._id === formData.eventId
                      );
                      if (selectedEvent?.isFull) {
                        return (
                          <p className="text-red-600 text-sm">
                            This event is full. Please select a different event.
                          </p>
                        );
                      }
                      if (selectedEvent && selectedEvent.available !== undefined) {
                        return (
                          <p className="text-gray-600 text-sm">
                            {selectedEvent.available} spot{selectedEvent.available !== 1 ? "s" : ""} available
                            {selectedEvent.vendorPrice > 0 && (
                              <span className="ml-2">
                                • Registration fee: ${(selectedEvent.vendorPrice / 100).toFixed(2)}
                              </span>
                            )}
                          </p>
                        );
                      }
                      return null;
                    })()
                  )}
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
                      disabled={
                        isSubmitting ||
                        !formData.eventId ||
                        (upcomingEvents?.find((e) => e._id === formData.eventId)?.isFull ?? false)
                      }
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
