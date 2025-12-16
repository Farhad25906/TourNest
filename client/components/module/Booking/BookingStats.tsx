"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IBookingStats } from "@/types/booking.interface";
import { DollarSign, Users, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

interface BookingStatsProps {
  stats: IBookingStats;
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statCards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      description: "All-time bookings",
    },
    {
      title: "Confirmed",
      value: stats.confirmedBookings,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: "Active bookings",
    },
    {
      title: "Pending",
      value: stats.pendingBookings,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      description: "Awaiting confirmation",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent?.toFixed(2) || "0.00"}`,
      icon: <DollarSign className="h-5 w-5 text-blue-600" />,
      description: "Total booking amount",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}