"use client";

import { api } from "@car-market/convex/_generated/api";
import { useQuery } from "convex/react";
import { Calendar, MapPin } from "lucide-react";
import { EventCard } from "../../../components/event-card";
import { Footer } from "../../../components/footer";
import { Navbar } from "../../../components/navbar";

export default function EventsPage() {
  const upcomingEvents = useQuery(api.events.getUpcomingEvents);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            Upcoming Events
          </h1>
          <p className="mx-auto max-w-3xl text-gray-600 text-xl">
            Join us at our monthly car market events. Meet sellers, browse
            vehicles, and find your next car in person.
          </p>
        </div>

        {/* Events Grid */}
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard event={event} key={event._id} showRegister={true} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 font-semibold text-gray-900 text-xl">
              No Upcoming Events
            </h3>
            <p className="text-gray-600">
              Check back soon for our next car market event!
            </p>
          </div>
        )}

        {/* Event Info */}
        <div className="mt-16 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-xl">
                What to Expect
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Browse dozens of vehicles in one location</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Meet sellers face-to-face</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Test drive vehicles on-site</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Get expert advice from our team</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-xl">
                Event Details
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Monthly events on weekends</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Various locations in the Raleigh area</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Free admission for buyers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Food trucks and refreshments available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
