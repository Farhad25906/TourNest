"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IBooking } from "@/types/booking.interface";
import { cancelBooking } from "@/services/booking/booking";
import CancelBookingDialog from "./CancelBookingDialog";

interface BookingActionsProps {
  booking: IBooking;
}

export default function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = () => {
    if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
      return false;
    }
    
    if (booking.paymentStatus === 'PAID') {
      // Additional logic for paid bookings
      const tourStartDate = booking.tour?.startDate ? new Date(booking.tour.startDate) : null;
      if (!tourStartDate) return false;
      
      const now = new Date();
      const daysUntilTour = Math.ceil((tourStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilTour >= 7;
    }
    
    return true; // Can cancel unpaid bookings anytime
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelBooking(booking.id);
      
      if (result.success) {
        toast.success("Booking cancelled successfully!");
        setShowCancelDialog(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactHost = () => {
    if (booking.tour?.host?.email) {
      window.location.href = `mailto:${booking.tour.host.email}?subject=Regarding booking: ${booking.tour.title}`;
    }
  };

  const handleViewTour = () => {
    if (booking.tour?.id) {
      router.push(`/tour/${booking.tour.id}`);
    }
  };

  const handlePayment = () => {
    if (booking.paymentStatus === 'PENDING') {
      // Redirect to payment page
      router.push(`/payment?bookingId=${booking.id}`);
    }
  };

  const handleLeaveReview = () => {
    if (booking.status === 'COMPLETED' && !booking.isReviewed) {
      router.push(`/reviews/create?bookingId=${booking.id}&tourId=${booking.tourId}`);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleViewTour}
          >
            View Tour Details
          </Button>

          {booking.paymentStatus === 'PENDING' && booking.status === 'CONFIRMED' && (
            <Button 
              className="w-full" 
              variant="default"
              onClick={handlePayment}
            >
              Make Payment
            </Button>
          )}

          {canCancel() && (
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Booking
            </Button>
          )}

          {booking.status === 'COMPLETED' && !booking.isReviewed && (
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={handleLeaveReview}
            >
              Leave a Review
            </Button>
          )}

          <Button 
            className="w-full" 
            variant="secondary"
            onClick={handleContactHost}
          >
            Contact Host
          </Button>

          <Button 
            className="w-full" 
            variant="ghost"
            onClick={() => router.push("/user/dashboard/my-bookings")}
          >
            Back to My Bookings
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Booking Dialog */}
      {showCancelDialog && (
        <CancelBookingDialog
          booking={booking}
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={handleCancel}
          isLoading={isCancelling}
        />
      )}
    </>
  );
}