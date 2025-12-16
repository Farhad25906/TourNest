import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  FileText,
  User,
  Home
} from "lucide-react";
import { getBooking } from "@/services/booking/booking";
import { cancelBooking } from "@/services/booking/booking";
import BookingActions from "@/components/module/Booking/BookingActions";

interface BookingDetailsPageProps {
  params: {
    id: string;
  };
}

async function BookingDetailsContent({ bookingId }: { bookingId: string }) {
  const bookingResponse = await getBooking(bookingId);
  
  if (!bookingResponse.success || !bookingResponse.data) {
    notFound();
  }

  const booking = bookingResponse.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-muted-foreground mt-2">
            Booking ID: {booking.id.slice(0, 8)}...
          </p>
        </div>
        <Badge className={`${getStatusColor(booking.status)} text-sm font-medium px-3 py-1`}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Tour Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{booking.tour?.title || "Tour not found"}</h3>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.tour?.destination}, {booking.tour?.city}, {booking.tour?.country}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                  </div>
                  <p className="font-medium">
                    {booking.tour?.startDate ? formatDate(booking.tour.startDate) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">End Date:</span>
                  </div>
                  <p className="font-medium">
                    {booking.tour?.endDate ? formatDate(booking.tour.endDate) : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration:</span>
                  </div>
                  <p className="font-medium">{booking.tour?.duration || 0} days</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Price per person:</span>
                  </div>
                  <p className="font-medium">{formatCurrency(booking.tour?.price || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          {booking.tour?.host && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Host Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {booking.tour.host.profilePhoto ? (
                      <img
                        src={booking.tour.host.profilePhoto}
                        alt={booking.tour.host.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {booking.tour.host.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{booking.tour.host.name}</h4>
                    <p className="text-sm text-muted-foreground">{booking.tour.host.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.specialRequests}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Booking Summary & Actions */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Date:</span>
                  <span className="font-medium">{formatDateTime(booking.bookingDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of People:</span>
                  <span className="font-medium">{booking.numberOfPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Person:</span>
                  <span className="font-medium">
                    {formatCurrency((booking.tour?.price || booking.totalAmount / booking.numberOfPeople))}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Actions */}
          <BookingActions booking={booking} />
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<BookingDetailsSkeleton />}>
        <BookingDetailsContent bookingId={params.id} />
      </Suspense>
    </div>
  );
}

function BookingDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}