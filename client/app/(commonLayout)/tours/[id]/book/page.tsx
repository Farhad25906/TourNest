import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CreateBookingForm from "@/components/module/Booking/CreateBookingForm";
import { getSingleTour } from "@/services/tour/hostTours";
import { getUserInfo } from "@/services/auth/getUserInfo";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import BookingError from "@/components/module/Booking/BookingError";

interface BookingPageProps {
  params: {
    id: string;
  };
}

async function BookingContent({ tourId }: { tourId: string }) {
  // Get tour details
  const tourResponse = await getSingleTour(tourId);
  
  if (!tourResponse.success || !tourResponse.data) {
    notFound();
  }

  const tour = tourResponse.data;

  // Check if tour is available for booking
  const currentDate = new Date();
  const tourStartDate = new Date(tour.startDate);
  
  if (!tour.isActive || tourStartDate < currentDate) {
    redirect(`/tours/${tourId}?error=tour_not_available`);
  }

  // Get user info to check if they can book
  const userResponse = await getUserInfo();
  
  // Uncomment this for production
  // if (!userResponse.success || userResponse.role !== "TOURIST") {
  //   redirect(`/login?redirect=/tours/${tourId}/book&message=Please login as a tourist to book tours`);
  // }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book Your Tour</CardTitle>
          <p className="text-muted-foreground">
            Complete your booking for: <span className="font-semibold">{tour.title}</span>
          </p>
        </CardHeader>
        <CardContent>
          <CreateBookingForm tour={tour} />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<BookingSkeleton />}>
        <ErrorBoundary fallback={<BookingError tourId={id} error={new Error("Failed to load booking page")} />}>
          <BookingContent tourId={id} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}