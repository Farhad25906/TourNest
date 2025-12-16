"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface BookingErrorProps {
  error: Error;
  tourId?: string;
}

export default function BookingError({ error, tourId }: BookingErrorProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Booking Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p>Sorry, we encountered an error while loading the booking page.</p>
                <p className="text-sm opacity-80">
                  Error: {error.message || "Unknown error occurred"}
                </p>
                <div className="flex gap-4 pt-2">
                  {tourId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tours/${tourId}`)}
                    >
                      Back to Tour
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/tours")}
                  >
                    Browse All Tours
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.refresh()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}