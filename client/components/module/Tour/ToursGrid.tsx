import { ITour } from "@/types/tour.interface";
import { TourCard } from "./TourCard";

interface ToursGridProps {
  tours: ITour[];
}

export function ToursGrid({ tours = [] }: ToursGridProps) {
  if (tours.length === 0) {
    return (
      <div className="text-center py-12">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No tours found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your search filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tours.map((tour) => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
}