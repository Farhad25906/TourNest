"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Star,
} from "lucide-react";
import Image from "next/image";
import { IBooking } from "@/types/booking.interface";
import { cancelBooking } from "@/services/booking/booking";
import CancelBookingDialog from "./CancelBookingDialog";
import UpdateBookingDialog from "./UpdateBookingDialog";

interface MyBookingsTableProps {
  bookings: IBooking[];
}

export function MyBookingsTable({ bookings = [] }: MyBookingsTableProps) {
  const router = useRouter();
  const [cancellingBooking, setCancellingBooking] = useState<IBooking | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<IBooking | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleViewTour = (booking: IBooking) => {
    if (booking.tour?.id) {
      router.push(`/tour/${booking.tour.id}`);
    }
  };

  const handleViewDetails = (booking: IBooking) => {
    router.push(`/user/dashboard/bookings/${booking.id}`);
  };

  const handleCancel = (booking: IBooking) => {
    setCancellingBooking(booking);
  };

  const handleUpdate = (booking: IBooking) => {
    setUpdatingBooking(booking);
  };

  const handlePayment = (booking: IBooking) => {
    if (booking.paymentStatus === 'PENDING') {
      router.push(`/payment?bookingId=${booking.id}`);
    }
  };

  const handleLeaveReview = (booking: IBooking) => {
    if (booking.status === 'COMPLETED' && !booking.isReviewed) {
      router.push(`/reviews/create?bookingId=${booking.id}&tourId=${booking.tourId}`);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    setIsLoading(cancellingBooking.id);
    try {
      const result = await cancelBooking(cancellingBooking.id);
      
      if (result.success) {
        toast.success("Booking cancelled successfully!");
        setCancellingBooking(null);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusBadge = (status: IBooking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: IBooking['paymentStatus']) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canCancel = (booking: IBooking) => {
    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
      return false;
    }
    
    if (booking.paymentStatus === 'PAID') {
      const tourStartDate = booking.tour?.startDate ? new Date(booking.tour.startDate) : null;
      if (!tourStartDate) return false;
      
      const now = new Date();
      const daysUntilTour = Math.ceil((tourStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilTour >= 7;
    }
    
    return true;
  };

  const canUpdate = (booking: IBooking) => {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No bookings yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by booking your first tour to begin your adventure
              </p>
            </div>
            <Button onClick={() => router.push("/tours")}>
              Browse Tours
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tour Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>People</TableHead>
              <TableHead>Booking Date</TableHead>
              <TableHead>Tour Dates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-24 rounded-md overflow-hidden">
                      {booking.tour?.images && booking.tour.images.length > 0 ? (
                        <Image
                          src={booking.tour.images[0]}
                          alt={booking.tour.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 96px) 100vw, 96px"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">
                        {booking.tour?.title || "Tour not found"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {booking.tour?.destination}, {booking.tour?.city}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Host: {booking.tour?.host?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(booking.status)}
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{booking.numberOfPeople}</span>
                  </div>
                  {booking.specialRequests && (
                    <div className="text-xs text-muted-foreground mt-1 truncate" title={booking.specialRequests}>
                      <FileText className="h-3 w-3 inline mr-1" />
                      Has notes
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(booking.bookingDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {booking.tour?.startDate
                        ? formatDate(booking.tour.startDate)
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      to {booking.tour?.endDate
                        ? formatDate(booking.tour.endDate)
                        : "N/A"}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewTour(booking)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Tour
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {canUpdate(booking) && (
                        <DropdownMenuItem onClick={() => handleUpdate(booking)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Booking
                        </DropdownMenuItem>
                      )}
                      {booking.paymentStatus === 'PENDING' && booking.status === 'CONFIRMED' && (
                        <DropdownMenuItem onClick={() => handlePayment(booking)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Make Payment
                        </DropdownMenuItem>
                      )}
                      {booking.status === 'COMPLETED' && !booking.isReviewed && (
                        <DropdownMenuItem onClick={() => handleLeaveReview(booking)}>
                          <Star className="h-4 w-4 mr-2" />
                          Leave Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {canCancel(booking) && (
                        <DropdownMenuItem 
                          onClick={() => handleCancel(booking)}
                          className="text-amber-600 focus:text-amber-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Booking Dialog */}
      {cancellingBooking && (
        <CancelBookingDialog
          booking={cancellingBooking}
          open={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onConfirm={handleConfirmCancel}
          isLoading={isLoading === cancellingBooking.id}
        />
      )}

      {/* Update Booking Dialog */}
      {updatingBooking && (
        <UpdateBookingDialog
          booking={updatingBooking}
          open={!!updatingBooking}
          onClose={() => setUpdatingBooking(null)}
        />
      )}
    </>
  );
}