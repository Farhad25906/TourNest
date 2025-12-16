import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

import BookingStats from "@/components/module/Booking/BookingStats";
import { getMyBookings, getMyBookingStats } from "@/services/booking/booking";
import { MyBookingsTable } from "@/components/module/Booking/MyBookingsTable";

async function BookingsContent() {
  const [bookingsResponse, statsResponse] = await Promise.all([
    getMyBookings(),
    getMyBookingStats()
  ]);

  const bookings = bookingsResponse?.data || [];
  const stats = statsResponse?.data || null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your tour bookings
          </p>
        </div>
      </div>

      {stats && <BookingStats stats={stats} />}
      
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            View, manage, and track all your tour bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MyBookingsTable bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
        <BookingsContent />
      </Suspense>
    </div>
  );
}