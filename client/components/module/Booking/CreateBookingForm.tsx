"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, MapPin, Clock, AlertCircle } from "lucide-react";
import { createBooking } from "@/services/booking/booking";
import { ITour } from "@/types/tour.interface";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateBookingFormProps {
  tour: ITour;
}

export default function CreateBookingForm({ tour }: CreateBookingFormProps) {
  const router = useRouter();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate available spots
  const availableSpots = tour.maxGroupSize - (tour.currentGroupSize || 0);
  const isTourAvailable = availableSpots > 0 && tour.isActive;
  const tourStartDate = new Date(tour.startDate);
  const currentDate = new Date();
  const isTourInFuture = tourStartDate > currentDate;

  // Calculate total amount
  const totalAmount = tour.price * numberOfPeople;

  // Validate number of people
  const validateNumberOfPeople = (value: number) => {
    if (value < 1) {
      setErrors(prev => ({ ...prev, numberOfPeople: "At least 1 person is required" }));
      return false;
    }
    if (value > availableSpots) {
      setErrors(prev => ({ ...prev, numberOfPeople: `Only ${availableSpots} spots available` }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.numberOfPeople;
      return newErrors;
    });
    return true;
  };

  // Validate special requests
  const validateSpecialRequests = (value: string) => {
    if (value.length > 500) {
      setErrors(prev => ({ ...prev, specialRequests: "Maximum 500 characters allowed" }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.specialRequests;
      return newErrors;
    });
    return true;
  };

  // Handle number of people change
  const handleNumberChange = (value: number) => {
    const numValue = Math.max(1, Math.min(value, availableSpots));
    setNumberOfPeople(numValue);
    validateNumberOfPeople(numValue);
  };

  // Handle special requests change
  const handleSpecialRequestsChange = (value: string) => {
    setSpecialRequests(value);
    validateSpecialRequests(value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const isNumberValid = validateNumberOfPeople(numberOfPeople);
    const isRequestsValid = validateSpecialRequests(specialRequests);

    if (!isNumberValid || !isRequestsValid) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        tourId: tour.id,
        numberOfPeople: numberOfPeople,
        totalAmount: totalAmount,
        specialRequests: specialRequests || undefined,
      };

      console.log("Submitting booking data:", bookingData);

      const result = await createBooking(bookingData);

      if (result.success) {
        toast.success("Booking created successfully!");
        router.push("/user/dashboard/my-bookings");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create booking");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      toast.error("An error occurred while creating the booking");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isTourAvailable || !isTourInFuture) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!isTourAvailable 
                  ? "This tour is fully booked or not active."
                  : "This tour has already started."}
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/tours")}>
              Browse Other Tours
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Tour</CardTitle>
        <CardDescription>
          Complete the form below to book your spot on this amazing tour
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tour Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg">{tour.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Destination:</span>
                  <p className="font-medium">{tour.destination}, {tour.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Dates:</span>
                  <p className="font-medium">
                    {new Date(tour.startDate).toLocaleDateString()} -{" "}
                    {new Date(tour.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{tour.duration} days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Available spots:</span>
                  <p className="font-medium">
                    <Badge variant={availableSpots > 0 ? "default" : "destructive"}>
                      {availableSpots} of {tour.maxGroupSize}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Number of People */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="numberOfPeople">Number of People *</Label>
              <span className="text-sm text-muted-foreground">
                Max: {availableSpots} people
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="numberOfPeople"
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  max={availableSpots}
                  value={numberOfPeople}
                  onChange={(e) => handleNumberChange(parseInt(e.target.value) || 1)}
                  className="w-full"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleNumberChange(numberOfPeople - 1)}
                  disabled={numberOfPeople <= 1 || isSubmitting}
                >
                  -
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleNumberChange(numberOfPeople + 1)}
                  disabled={numberOfPeople >= availableSpots || isSubmitting}
                >
                  +
                </Button>
              </div>
            </div>
            {errors.numberOfPeople && (
              <p className="text-sm text-red-600">{errors.numberOfPeople}</p>
            )}
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <span className="text-sm text-muted-foreground">
                {specialRequests.length}/500 characters
              </span>
            </div>
            <Textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Any dietary restrictions, accessibility needs, or special requirements..."
              rows={3}
              value={specialRequests}
              onChange={(e) => handleSpecialRequestsChange(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.specialRequests && (
              <p className="text-sm text-red-600">{errors.specialRequests}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Optional. Let the host know about any special requirements.
            </p>
          </div>

          {/* Price Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <h3 className="font-semibold">Price Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per person:</span>
                <span className="font-medium">${tour.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of people:</span>
                <span className="font-medium">{numberOfPeople}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              By booking this tour, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline" target="_blank">
                Terms and Conditions
              </a>
              .
            </p>
            <p>
              Your booking will be confirmed by the host within 24 hours.
              You can cancel up to 7 days before the tour start date for a full refund.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? "Processing..." : `Book Now for $${totalAmount.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}