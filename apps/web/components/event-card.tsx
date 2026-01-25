"use client";

import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";

type Event = {
  _id: string;
  name: string;
  date: number;
  location: string;
  address: string;
  capacity: number;
  description: string;
  city?: {
    name: string;
    state: string;
  };
};

type EventCardProps = {
  event: Event;
  showRegister?: boolean;
};

export function EventCard({ event, showRegister = true }: EventCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      shortDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  const { date, time, shortDate, dayOfWeek } = formatDate(event.date);
  const isUpcoming = event.date > Date.now();

  // Calculate days until event
  const daysUntil = Math.ceil((event.date - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="group overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/50">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Date Badge */}
          <div className="relative flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-primary to-primary/90 p-6 text-white sm:w-32">
            <div className="text-center">
              <div className="text-sm font-medium uppercase tracking-wider opacity-90">
                {dayOfWeek}
              </div>
              <div className="text-4xl font-bold leading-none">
                {new Date(event.date).getDate()}
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-wider opacity-90">
                {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
              </div>
            </div>

            {/* Upcoming Badge */}
            {isUpcoming && daysUntil <= 7 && (
              <div className="absolute top-2 right-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex-1">
              {/* Event Name */}
              <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                {event.name}
              </h3>

              {/* City/State */}
              {event.city && (
                <p className="mb-4 text-sm font-medium text-primary">
                  {event.city.name}, {event.city.state}
                </p>
              )}

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{event.capacity} vendor spots</span>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/events/${event._id}`} className="flex items-center justify-center gap-2">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        {showRegister && isUpcoming && (
          <Button asChild className="flex-1 shadow-sm">
            <Link href={`/events/${event._id}`}>
              Register Now
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
