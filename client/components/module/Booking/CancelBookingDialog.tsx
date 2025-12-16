"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IBooking } from "@/types/booking.interface";
import { AlertTriangle, Calendar, DollarSign, Users, CreditCard } from "lucide-react";

interface CancelBookingDialogProps {
  booking: IBooking;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function CancelBookingDialog({
  booking,
  open,
  onClose,
  onConfirm,
  isLoading,
}: CancelBookingDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate refund eligibility
  const tourStartDate = booking.tour?.startDate ? new Date(booking.tour.startDate) : null;
  const now = new Date();
  const daysUntilTour = tourStartDate 
    ? Math.ceil((tourStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const isRefundEligible = daysUntilTour >= 7;
  const refundPercentage = isRefundEligible ? 100 : 0;

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Booking Details */}
        <div className="rounded-lg border p-4">
          <div className="space-y-3">
            <h4 className="font-semibold">{booking.tour?.title || "Tour"}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Tour Dates:</span>
                </div>
                <p>
                  {booking.tour?.startDate ? formatDate(booking.tour.startDate) : "N/A"} -{" "}
                  {booking.tour?.endDate ? formatDate(booking.tour.endDate) : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">People:</span>
                </div>
                <p>{booking.numberOfPeople} person{booking.numberOfPeople > 1 ? 's' : ''}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Amount:</span>
                </div>
                <p>{formatCurrency(booking.totalAmount)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Payment Status:</span>
                </div>
                <p className="font-medium capitalize">{booking.paymentStatus?.toLowerCase()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Booking Status:</span>
                </div>
                <p className="font-medium">{booking.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">
                {isRefundEligible ? "Full Refund Available" : "Refund Information"}
              </h4>
              <p className="text-sm text-amber-700">
                {isRefundEligible 
                  ? `You are eligible for a ${refundPercentage}% refund (${formatCurrency(booking.totalAmount)}) as you're cancelling more than 7 days before the tour.`
                  : `Cancelling within 7 days of the tour start date (${daysUntilTour} days remaining) may result in no refund. Please review the cancellation policy.`
                }
              </p>
              {booking.specialRequests && (
                <p className="text-sm text-amber-700 mt-2">
                  <strong>Note:</strong> Your special requests will also be cancelled.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-2">Cancellation Policy</h4>
          <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
            <li>Cancel 7+ days before tour for 100% refund</li>
            <li>Cancel 3-6 days before tour for 50% refund</li>
            <li>Cancel less than 3 days before tour for no refund</li>
            <li>Refunds are processed within 5-10 business days</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Go Back</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}