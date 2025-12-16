"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
// import { formatCurrency } from "@/lib/utils";
import { HostTourStats as IHostTourStats } from "@/services/tour/hostTours";

interface HostTourStatsProps {
  stats: IHostTourStats;
}

export default function HostTourStats({ stats }: HostTourStatsProps) {
  const {
    totalTours,
    activeTours,
    featuredTours,
    totalViews,
    upcomingTours,
    pastTours,
    totalBookings,
    confirmedBookings,
    toursByCategory,
    tourLimit,
    currentTourCount,
    tourCreationAvailable,
  } = stats;

  const tourUsagePercentage = Math.round((currentTourCount / tourLimit) * 100);

  const statsCards = [
    {
      title: "Total Tours",
      value: totalTours.toString(),
      icon: BarChart3,
      description: `${activeTours} active, ${featuredTours} featured`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      description: "Total page views",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Bookings",
      value: totalBookings.toString(),
      icon: Users,
      description: `${confirmedBookings} confirmed`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Upcoming Tours",
      value: upcomingTours.toString(),
      icon: Calendar,
      description: `${pastTours} completed`,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tour Limit Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tour Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tours Created</span>
              <span className="font-medium">
                {currentTourCount} / {tourLimit}
              </span>
            </div>
            <Progress value={tourUsagePercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {tourCreationAvailable
                ? `You can create ${tourLimit - currentTourCount} more tour${tourLimit - currentTourCount === 1 ? "" : "s"}`
                : "Tour limit reached. Upgrade to create more tours."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tours by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(toursByCategory).map(([category, count]) => (
              <Badge key={category} variant="secondary" className="px-3 py-1.5">
                <span className="font-medium">{category}:</span>
                <span className="ml-1">{count}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Rate
                </p>
                <h3 className="text-xl font-bold mt-1">
                  {totalTours > 0
                    ? Math.round((activeTours / totalTours) * 100)
                    : 0}
                  %
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Views per Tour
                </p>
                <h3 className="text-xl font-bold mt-1">
                  {totalTours > 0
                    ? Math.round(totalViews / totalTours)
                    : 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Rate
                </p>
                <h3 className="text-xl font-bold mt-1">
                  {totalTours > 0
                    ? Math.round((upcomingTours / totalTours) * 100)
                    : 0}
                  %
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}