"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardFooter } from "@gearboxe-market/ui/card";

type Event = {
  _id: string;
  name: string;
  date: number;
  location: string;
  address: string;
  capacity: number;
  description: string;
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
    };
  };

  const { date, time } = formatDate(event.date);
  const isUpcoming = event.date > Date.now();

  return (
    <Card className="group hover:-translate-y-0.5 overflow-hidden border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-gray-200/50 hover:shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="line-clamp-1 font-semibold text-xl">{event.name}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <Calendar className="h-4 w-4 opacity-0" />
              <span>{time}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <Users className="h-4 w-4" />
              <span>Capacity: {event.capacity} vendors</span>
            </div>
          </div>

          {event.description && (
            <p className="line-clamp-3 text-gray-700 text-sm">
              {event.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/events/${event._id}`}>View Details</Link>
        </Button>
        {showRegister && isUpcoming && (
          <Button asChild className="text-white">
            <Link href={`/events/${event._id}`}>Register</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
