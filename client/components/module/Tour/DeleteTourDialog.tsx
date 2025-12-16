"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { deleteTour } from "@/services/tour/hostTours";
import { ITour } from "@/types/tour.interface";
import { AlertTriangle } from "lucide-react";

interface DeleteTourDialogProps {
  tour: ITour;
  open: boolean;
  onClose: () => void;
}

export default function DeleteTourDialog({
  tour,
  open,
  onClose,
}: DeleteTourDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTour(tour.id);
      
      if (result.success) {
        toast.success("Tour deleted successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete tour");
      }
    } catch (error) {
      console.error("Delete tour error:", error);
      toast.error("Failed to delete tour");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasBookings = (tour.bookingCount || 0) > 0;
  const isUpcoming = new Date(tour.startDate) > new Date();

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete Tour</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete this tour?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="rounded-lg bg-muted p-4">
          <div className="space-y-2">
            <h4 className="font-semibold">{tour.title}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p>{tour.destination}, {tour.city}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dates:</span>
                <p>
                  {new Date(tour.startDate).toLocaleDateString()} -{" "}
                  {new Date(tour.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Bookings:</span>
                <p>{tour.bookingCount || 0} bookings</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p>{tour.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>
        </div>

        {hasBookings && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-amber-800">Warning: Active Bookings</h4>
                <p className="text-sm text-amber-700">
                  This tour has {tour.bookingCount} active booking{tour.bookingCount === 1 ? "" : "s"}. 
                  Deleting it will cancel all associated bookings and may result in refunds.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isUpcoming && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-800">Tour Has Started</h4>
                <p className="text-sm text-blue-700">
                  This tour has already started or completed. Consider archiving instead of deleting.
                </p>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Tour"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}