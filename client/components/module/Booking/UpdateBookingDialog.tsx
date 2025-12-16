"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IBooking } from "@/types/booking.interface";
import { updateBooking } from "@/services/booking/booking";
import { updateBookingValidationSchema, UpdateBookingInput } from "@/zod/booking.validation";

interface UpdateBookingDialogProps {
  booking: IBooking;
  open: boolean;
  onClose: () => void;
}

export default function UpdateBookingDialog({
  booking,
  open,
  onClose,
}: UpdateBookingDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateBookingInput>({
    resolver: zodResolver(updateBookingValidationSchema),
    defaultValues: {
      numberOfPeople: booking.numberOfPeople,
      specialRequests: booking.specialRequests || "",
    },
  });

  const onSubmit = async (data: UpdateBookingInput) => {
    setIsSubmitting(true);
    try {
      const updateData: any = {};
      
      // Only include fields that have changed
      if (data.numberOfPeople !== undefined && data.numberOfPeople !== booking.numberOfPeople) {
        updateData.numberOfPeople = data.numberOfPeople;
        // Recalculate total amount if number of people changed
        if (booking.tour?.price) {
          updateData.totalAmount = booking.tour.price * data.numberOfPeople;
        }
      }
      
      if (data.specialRequests !== undefined && data.specialRequests !== booking.specialRequests) {
        updateData.specialRequests = data.specialRequests;
      }

      console.log('Updating booking with:', updateData);

      // Only call API if there are changes
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes detected");
        onClose();
        return;
      }

      const result = await updateBooking(booking.id, updateData);

      if (result.success) {
        toast.success("Booking updated successfully!");
        onClose();
        router.refresh();
      } else {
        // Show validation errors if any
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          });
        } else {
          toast.error(result.message || "Failed to update booking");
        }
      }
    } catch (error) {
      console.error("Update booking error:", error);
      toast.error("Failed to update booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate available spots for the tour
  const availableSpots = booking.tour 
    ? booking.tour.maxGroupSize - (booking.tour.currentGroupSize || 0) + booking.numberOfPeople
    : 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Booking</DialogTitle>
          <DialogDescription>
            Update the number of people or special requests for your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-slate-50 rounded-md">
          <h4 className="font-medium mb-2">{booking.tour?.title || "Tour"}</h4>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Currently booked: {booking.numberOfPeople} person{booking.numberOfPeople > 1 ? 's' : ''}</p>
            <p>Max available spots for update: {availableSpots}</p>
            <p>Status: <span className="font-medium">{booking.status}</span></p>
            <p>Payment Status: <span className="font-medium capitalize">{booking.paymentStatus?.toLowerCase()}</span></p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Number of People */}
            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of People</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={availableSpots}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? undefined : parseInt(value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum {availableSpots} spots available for this update
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Requests */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Update any special requirements or notes..."
                      className="resize-none"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Let the host know about any changes to your requirements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Special Requests (if any) */}
            {booking.specialRequests && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm font-medium text-amber-800 mb-1">Current Special Requests:</p>
                <p className="text-sm text-amber-700">{booking.specialRequests}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}