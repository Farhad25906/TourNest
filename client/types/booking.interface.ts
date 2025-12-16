export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface IBooking {
  id: string;
  touristId: string;
  tourId: string;
  userId: string;
  numberOfPeople: number;
  totalAmount: number;
  specialRequests?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  isReviewed: boolean;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  tourist?: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  
  tour?: {
    id: string;
    title: string;
    destination: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    price: number;
    maxGroupSize: number;
    currentGroupSize: number;
    isActive: boolean;
    images: string[];
    host: {
      id: string;
      name: string;
      email: string;
      profilePhoto?: string;
      phone?: string;
      bio?: string;
    };
  };

  user?: {
    id: string;
    email: string;
    role: string;
  };

  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId?: string;
    paidAt?: string;
  }>;
}

export interface ICreateBookingInput {
  tourId: string;
  numberOfPeople: number;
  totalAmount: number;
  specialRequests?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

export interface IUpdateBookingInput {
  numberOfPeople?: number;
  totalAmount?: number;
  specialRequests?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  isReviewed?: boolean;
}

export interface IBookingFilters {
  searchTerm?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  isReviewed?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IBookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue?: number;
  totalSpent?: number;
  upcomingTrips?: number;
  pastTrips?: number;
  recentBookings?: Array<{
    id: string;
    tourTitle: string;
    destination: string;
    bookingDate: string;
    status: BookingStatus;
    totalAmount: number;
  }>;
  favoriteDestination?: {
    destination: string;
    count: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  errors?: Record<string, string[]>;
}