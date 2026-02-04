"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@car-market/ui/card";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowLeft, Car, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { use } from "react";
import { Footer } from "../../../../../../components/footer";
import { MessageThread } from "../../../../../../components/message-thread";
import { Navbar } from "../../../../../../components/navbar";

interface ConversationPageProps {
  params: Promise<{
    vehicleId: string;
    userId: string;
  }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { vehicleId, userId } = use(params);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();

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
  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const vehicle = useQuery(
    api.vehicles.getVehicleById,
    vehicleId ? { id: vehicleId as any } : "skip"
  );
  const otherUser = useQuery(
    api.users.getUserById,
    userId ? { id: userId as any } : "skip"
  );

  // Get conversation by participants
  const conversation = useQuery(
    api.conversations.getConversationByParticipants,
    currentUser?._id && vehicleId && userId
      ? {
          vehicleId: vehicleId as any,
          participant1Id: currentUser._id as any,
          participant2Id: userId as any,
        }
      : "skip"
  );

  if (!(isAuthenticated && user)) {
    redirect("/sign-in");
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center space-x-2 text-gray-600 text-sm">
            <Link
              className="flex items-center transition-colors hover:text-primary"
              href="/myAccount/messages"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Messages
            </Link>
            <span>/</span>
            <span className="font-medium">Conversation</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900">
                Conversation {otherUser && `with ${otherUser.name}`}
              </h1>
            </div>
            {vehicle && (
              <Button asChild variant="outline">
                <Link href={`/vehicles/${vehicle._id}`}>
                  <Car className="mr-2 h-4 w-4" />
                  View Vehicle
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Vehicle Info Sidebar */}
          {vehicle && (
            <div className="lg:col-span-1">
              <Card className="mb-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="font-semibold text-gray-900 text-lg">
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="mb-2 font-bold text-gray-900 text-xl">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600 text-sm">
                            Mileage
                          </span>
                          <span className="font-semibold text-gray-900 text-sm">
                            {vehicle.mileage.toLocaleString()} miles
                          </span>
                        </div>
                        <div className="border-gray-200 border-t pt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-600 text-sm">
                              Price
                            </span>
                            <span className="font-bold text-primary text-xl">
                              {formatPrice(vehicle.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Owner Sidebar */}
              {otherUser && (
                <Card className="shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-semibold text-gray-900 text-lg">
                      Vehicle Owner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="mb-3 font-bold text-gray-900 text-lg">
                          {otherUser.name}
                        </h3>
                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center justify-center space-x-2 text-gray-600 text-sm">
                            <span className="font-medium">Member since</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(otherUser.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Message Thread */}
          <div className="lg:col-span-3">
            <MessageThread
              conversationId={conversation?._id}
              recipientId={userId as any}
              recipientName={otherUser?.name || "User"}
              vehicleId={vehicleId as any}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
