import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  DollarSign,
  CheckCircle,
  Shield,
  Heart
} from "lucide-react";
import { getSingleTour } from "@/services/tour/hostTours";
import TourGallery from "@/components/module/Tour/TourGallery";
import TourItinerary from "@/components/module/Tour/TourItinerary";
import TourHostInfo from "@/components/module/Tour/TourHostInfo";

interface TourDetailsPageProps {
  params: {
    id: string;
  };
}

async function TourDetailsContent({ tourId }: { tourId: string }) {
console.log(tourId);

  
  const tourResponse = await getSingleTour(tourId);
      console.log("Tour Response:", tourResponse);

  
  if (!tourResponse.success || !tourResponse.data) {
    notFound();
  }

  const tour = tourResponse.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const calculateAvailableSpots = () => {
    return tour.maxGroupSize - (tour.currentGroupSize || 0);
  };

  const availableSpots = calculateAvailableSpots();
  const isAvailable = tour.isActive && availableSpots > 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back to Tours */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/tours">
            ← Back to Tours
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tour Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="capitalize">{tour.category.toLowerCase()}</Badge>
              {tour.isFeatured && (
                <Badge className="bg-amber-500 hover:bg-amber-600">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Featured
                </Badge>
              )}
              <Badge 
                variant={isAvailable ? "default" : "destructive"}
              >
                {isAvailable ? `${availableSpots} spots left` : 'Fully Booked'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`
                  ${tour.difficulty === 'EASY' ? 'border-green-200 text-green-700' : ''}
                  ${tour.difficulty === 'MODERATE' ? 'border-amber-200 text-amber-700' : ''}
                  ${tour.difficulty === 'DIFFICULT' ? 'border-orange-200 text-orange-700' : ''}
                  ${tour.difficulty === 'EXTREME' ? 'border-red-200 text-red-700' : ''}
                `}
              >
                {tour.difficulty}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">{tour.title}</h1>
            
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span>{tour.destination}, {tour.city}, {tour.country}</span>
            </div>
          </div>

          {/* Tour Gallery */}
          {tour.images && tour.images.length > 0 && (
            <TourGallery images={tour.images} />
          )}

          {/* Tour Description */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About This Tour</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{tour.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tour Highlights */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Tour Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <ul className="space-y-2">
                    {tour.included && tour.included.length > 0 ? (
                      tour.included.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No inclusions specified</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What's Not Included</h3>
                  <ul className="space-y-2">
                    {tour.excluded && tour.excluded.length > 0 ? (
                      tour.excluded.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No exclusions specified</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itinerary */}
          {tour.itinerary && (
            <TourItinerary itinerary={tour.itinerary} />
          )}

          {/* Meeting Point */}
          {tour.meetingPoint && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Meeting Point</h2>
                <p className="text-gray-700">{tour.meetingPoint}</p>
              </CardContent>
            </Card>
          )}

          {/* Host Information */}
          {tour.host && (
            <TourHostInfo host={tour.host} />
          )}
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {formatCurrency(tour.price)}
                  </div>
                  <p className="text-muted-foreground">per person</p>
                </div>

                <Separator />

                {/* Tour Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {tour.duration} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Dates</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(tour.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Group Size</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tour.maxGroupSize} max
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Spots</span>
                    <span className="font-medium">
                      {availableSpots} of {tour.maxGroupSize}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Availability Status */}
                {!isAvailable && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium text-center">
                      {availableSpots <= 0 ? 'Fully Booked' : 'Not Available'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!isAvailable}
                    asChild
                  >
                    <Link href={`/tours/${tour.id}/book`}>
                      Book Now
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link href={`/tours/${tour.id}/book`}>
                      <Heart className="h-4 w-4 mr-2" />
                      Save to Wishlist
                    </Link>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    asChild
                  >
                    <Link href={`/tours/${tour.id}/book`}>
                      Share Tour
                    </Link>
                  </Button>
                </div>

                {/* Important Notes */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ Free cancellation up to 7 days before</p>
                  <p>✓ Reserve now, pay later</p>
                  <p>✓ Instant confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/faq">
                    Read FAQs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default async function TourDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<TourDetailsSkeleton />}>
        <TourDetailsContent tourId={id} />
      </Suspense>
    </div>
  );
}


function TourDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <Skeleton className="h-96 w-full rounded-lg" />

          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-12 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Separator className="my-6" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Separator className="my-6" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}