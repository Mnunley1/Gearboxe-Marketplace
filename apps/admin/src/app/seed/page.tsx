"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { useMutation } from "convex/react";
import {
  Calendar,
  Car,
  Database,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../../../lib/admin-auth-context";

export default function SeedPage() {
  useAdminAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const migrateVehiclePhotos = useMutation(api.vehicles.migrateVehiclePhotos);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      setSeedResult(result);
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateVehiclePhotos();
      setMigrationResult(result);
    } catch (error) {
      console.error("Error migrating vehicle photos:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold font-heading text-3xl text-gray-900">
          Database Seeding
        </h1>
        <p className="text-gray-600">Add test data for development.</p>
      </div>

      {/* Migration Button */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center font-heading">
            <RefreshCw className="mr-2 h-5 w-5" />
            Migrate Vehicle Photos
          </CardTitle>
          <CardDescription>
            Fix vehicles that have URL strings in their photos array. This will
            remove invalid URLs and keep only valid storage IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={isMigrating}
            onClick={handleMigrate}
            variant="outline"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Migration
              </>
            )}
          </Button>
          {migrationResult && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                Migration Complete!
              </p>
              <p className="text-green-700 text-sm">
                Fixed {migrationResult.fixed} out of {migrationResult.total}{" "}
                vehicles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seed Button */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center font-heading">
            <Database className="mr-2 h-5 w-5" />
            Seed Database
          </CardTitle>
          <CardDescription>
            This will add fake users, vehicles, events, and other test data to
            your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="text-white"
            disabled={isSeeding}
            onClick={handleSeed}
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {seedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-green-600">
              Seeding Complete!
            </CardTitle>
            <CardDescription>Test data has been added.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-primary-50 p-4 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="font-bold text-2xl text-primary">
                  {seedResult.users}
                </div>
                <div className="text-gray-600 text-sm">Users</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <Car className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="font-bold text-2xl text-green-600">
                  {seedResult.vehicles}
                </div>
                <div className="text-gray-600 text-sm">Vehicles</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                <div className="font-bold text-2xl text-purple-600">
                  {seedResult.events}
                </div>
                <div className="text-gray-600 text-sm">Events</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                <div className="font-bold text-2xl text-orange-600">
                  {seedResult.messages}
                </div>
                <div className="text-gray-600 text-sm">Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
