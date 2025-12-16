import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ToursGrid } from "@/components/module/Tour/ToursGrid";
import { ToursFilters } from "@/components/module/Tour/ToursFilters";
import PaginationControls from "@/components/shared/PaginationControls";
import { getAllTours } from "@/services/tour/hostTours";
import { TourFilters } from "@/types/tour.interface";

export const metadata: Metadata = {
  title: "Explore Tours | TourNest",
  description: "Discover amazing tours and adventures around the world",
};

interface ToursPageProps {
  searchParams: Promise<{
    searchTerm?: string;
    category?: string;
    difficulty?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
  }>;
}

async function ToursContent({ searchParams }: { searchParams: any }) {
  // Await the searchParams Promise
  const params = await searchParams;
  
  const filters: TourFilters = {
    searchTerm: params.searchTerm,
    category: params.category,
    difficulty: params.difficulty,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 12,
  };

  const response = await getAllTours(filters);
  console.log(response);
  
  const tours = response.data || [];
  const meta = response.meta || { page: 1, limit: 12, total: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Explore Tours</h1>
        <p className="text-muted-foreground mt-2">
          Discover amazing adventures and experiences around the world
        </p>
      </div>

      {/* Filters */}
      <ToursFilters />

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {tours.length} of {meta.total} tours
        </p>
      </div>

      {/* Tours Grid */}
      {tours.length > 0 ? (
        <ToursGrid tours={tours} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg 
                className="h-12 w-12 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No tours found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Try adjusting your search filters or check back later for new tours
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {meta.total > meta.limit && (
        <PaginationControls
          currentPage={meta.page}
          totalPages={Math.ceil(meta.total / meta.limit)}
          totalItems={meta.total}
          itemsPerPage={meta.limit}
        />
      )}
    </div>
  );
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<ToursSkeleton />}>
        <ToursContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function ToursSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>

      {/* Results Count Skeleton */}
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />

      {/* Tours Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <div className="h-48 bg-muted animate-pulse rounded-t-lg" />
            <CardContent className="pt-4 space-y-3">
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}