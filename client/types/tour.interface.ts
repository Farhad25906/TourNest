/* eslint-disable @typescript-eslint/no-explicit-any */
// Define categories and difficulties
export const CATEGORIES = [
  'ADVENTURE', 'CULTURE', 'FOOD', 'NATURE', 'RELAXATION',
  'URBAN', 'BEACH', 'MOUNTAIN'
] as const;

export const DIFFICULTIES = ['EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'] as const;

export type TourCategory = typeof CATEGORIES[number];
export type DifficultyLevel = typeof DIFFICULTIES[number];

// Define itinerary type without Prisma
export type ItineraryItem = {
  day: number;
  title: string;
  description: string;
  activities: string[];
  accommodation?: string;
  meals?: string[];
};

export type TourItinerary = ItineraryItem[];

// Main Tour interface
export interface ITour {
  id: string;
  title: string;
  description: string;
  destination: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  price: number;
  maxGroupSize: number;
  currentGroupSize: number;
  category: TourCategory;
  difficulty: DifficultyLevel;
  included: string[];
  excluded: string[];
  itinerary: TourItinerary | any; // Can be TourItinerary or any JSON
  meetingPoint: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
  bookingCount?: number;
  host?: {
    id: string;
    name: string;
    profilePhoto: string | null;
    bio: string | null;
  };
}

// Input types for forms
export type CreateTourInput = {
  title: string;
  description: string;
  destination: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  price: number;
  maxGroupSize: number;
  category: TourCategory;
  difficulty: DifficultyLevel;
  included: string[];
  excluded: string[];
  itinerary?: TourItinerary | any;
  meetingPoint: string;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
};

export type UpdateTourInput = Partial<CreateTourInput>;

// Filter interfaces for API calls
export interface HostTourFilters {
  searchTerm?: string;
  destination?: string;
  city?: string;
  country?: string;
  category?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface HostTourStats {
  totalTours: number;
  activeTours: number;
  featuredTours: number;
  totalViews: number;
  upcomingTours: number;
  pastTours: number;
  totalBookings: number;
  confirmedBookings: number;
  toursByCategory: Record<string, number>;
  toursByStatus: {
    active: number;
    inactive: number;
    featured: number;
  };
  recentTours: Array<{
    id: string;
    title: string;
    createdAt: Date;
    status: string;
    views: number;
    bookingCount: number;
  }>;
  tourLimit: number;
  currentTourCount: number;
  tourCreationAvailable: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search filters for public tours
export interface TourFilters {
  searchTerm?: string;
  destination?: string;
  city?: string;
  country?: string;
  category?: TourCategory;
  difficulty?: DifficultyLevel;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  hostId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}