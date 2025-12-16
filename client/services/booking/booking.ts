/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";
import {
  IBooking,
  IBookingFilters,
  IBookingStats,
  ApiResponse,
} from "@/types/booking.interface";

// ==================== CREATE & UPDATE SERVICES ====================

export async function validateBookingData(data: {
  tourId: string;
  numberOfPeople: number;
  totalAmount: number;
}): Promise<ApiResponse<{ valid: boolean; message: string }>> {
  try {
    // Check if tour exists and is active
    const tourResponse = await serverFetch.get(`/tours/${data.tourId}`);
    const tourResult = await tourResponse.json();

    if (!tourResult.success || !tourResult.data) {
      return {
        success: false,
        message: "Tour not found",
      };
    }

    const tour = tourResult.data;
    const availableSpots = tour.maxGroupSize - (tour.currentGroupSize || 0);

    // Validate number of people
    if (data.numberOfPeople < 1) {
      return {
        success: false,
        message: "At least 1 person is required",
      };
    }

    if (data.numberOfPeople > availableSpots) {
      return {
        success: false,
        message: `Only ${availableSpots} spots available`,
      };
    }

    // Validate total amount
    const expectedTotal = tour.price * data.numberOfPeople;
    if (Math.abs(data.totalAmount - expectedTotal) > 0.01) {
      return {
        success: false,
        message: "Total amount calculation error",
      };
    }

    return {
      success: true,
      data: {
        valid: true,
        message: "Booking data is valid",
      },
    };
  } catch (error: any) {
    console.error("Validate booking data error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Validation failed"
      }`,
    };
  }
}

export const createBooking = async (
  bookingData: {
    tourId: string;
    numberOfPeople: number;
    totalAmount: number;
    specialRequests?: string;
  }
): Promise<ApiResponse<IBooking>> => {
  try {
    console.log("Creating booking with data:", bookingData);

    // Make API call
    const res = await serverFetch.post("/bookings", {
      body: JSON.stringify({
        ...bookingData,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    console.log("API response:", result);

    if (result.success) {
      // Revalidate cache
      revalidateTag("my-bookings");
      revalidateTag("my-booking-stats");
      revalidateTag("host-bookings");
      revalidateTag("host-booking-stats");

      return {
        success: true,
        message: "Booking created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create booking",
      data: result.data,
    };
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Booking creation error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to create booking. Please try again."
      }`,
    };
  }
};

export const updateBooking = async (
  bookingId: string,
  updateData: {
    numberOfPeople?: number;
    totalAmount?: number;
    specialRequests?: string;
    status?: string;
    paymentStatus?: string;
    isReviewed?: boolean;
  }
): Promise<ApiResponse<IBooking>> => {
  try {
    console.log("Updating booking with data:", updateData);

    // Make API call for update
    const res = await serverFetch.patch(`/bookings/${bookingId}`, {
      body: JSON.stringify(updateData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    console.log("API response:", result);

    if (result.success) {
      // Revalidate cache
      revalidateTag("my-bookings");
      revalidateTag("host-bookings");
      revalidateTag(`booking-${bookingId}`);

      return {
        success: true,
        message: "Booking updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update booking",
      data: result.data,
    };
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Booking update error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to update booking. Please try again."
      }`,
    };
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: string
): Promise<ApiResponse<IBooking>> => {
  try {
    console.log("Updating booking status:", { bookingId, status });

    // Make API call for status update
    const res = await serverFetch.patch(`/bookings/${bookingId}/status`, {
      body: JSON.stringify({ status }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    console.log("API response:", result);

    if (result.success) {
      // Revalidate cache
      revalidateTag("my-bookings");
      revalidateTag("host-bookings");
      revalidateTag("host-booking-stats");
      revalidateTag(`booking-${bookingId}`);

      return {
        success: true,
        message: "Booking status updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update booking status",
      data: result.data,
    };
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Booking status update error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to update booking status. Please try again."
      }`,
    };
  }
};

// ==================== GET & DELETE SERVICES ====================

// Get all bookings (admin only)
export async function getAllBookings(
  filters?: IBookingFilters
): Promise<ApiResponse<IBooking[]>> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();

    const response = await serverFetch.get(
      `/bookings${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          tags: ["all-bookings"],
          revalidate: 60,
        },
      }
    );

    const result = await response.json();
    console.log("Get all bookings response:", result);

    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data : [],
      meta: result.meta,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Get all bookings error:", error);
    return {
      success: false,
      data: [],
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch bookings"
      }`,
    };
  }
}

// Get my bookings (tourist)
export async function getMyBookings(
  filters?: IBookingFilters
): Promise<ApiResponse<IBooking[]>> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();

    const response = await serverFetch.get(
      `/bookings/my-bookings${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          tags: ["my-bookings"],
          revalidate: 30,
        },
      }
    );

    const result = await response.json();
    console.log("Get my bookings response:", result);

    return {
      success: result.success,
      data: Array.isArray(result.data) ? (result.data as IBooking[]) : [],
      meta: result.meta,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Get my bookings error:", error);
    return {
      success: false,
      data: [],
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch your bookings"
      }`,
    };
  }
}

// Get host bookings
export async function getHostBookings(
  filters?: IBookingFilters
): Promise<ApiResponse<IBooking[]>> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();

    const response = await serverFetch.get(
      `/bookings/host/my-bookings${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          tags: ["host-bookings"],
          revalidate: 30,
        },
      }
    );

    const result = await response.json();
    console.log("Get host bookings response:", result);

    return {
      success: result.success,
      data: Array.isArray(result.data) ? (result.data as IBooking[]) : [],
      meta: result.meta,
      message: result.message,
    };
  } catch (error: any) {
    console.error("Get host bookings error:", error);
    return {
      success: false,
      data: [],
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch host bookings"
      }`,
    };
  }
}

// Get single booking
export async function getBooking(
  bookingId: string
): Promise<ApiResponse<IBooking>> {
  try {
    const response = await serverFetch.get(`/bookings/${bookingId}`, {
      next: {
        tags: [`booking-${bookingId}`],
        revalidate: 60,
      },
    });

    const result = await response.json();
    console.log("Get booking response:", result);

    if (result.success) {
      return {
        success: true,
        data: result.data as IBooking,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to fetch booking",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Get booking error:", error);
    return {
      success: false,
      data: null,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch booking details"
      }`,
    };
  }
}

// Cancel booking
export async function cancelBooking(bookingId: string): Promise<ApiResponse> {
  try {
    console.log("Cancelling booking:", bookingId);

    const response = await serverFetch.patch(`/bookings/${bookingId}/cancel`);
    const result = await response.json();

    console.log("Cancel booking response:", result);

    if (result.success) {
      // Revalidate relevant cache tags
      revalidateTag("my-bookings");
      revalidateTag("host-bookings");
      revalidateTag("my-booking-stats");
      revalidateTag("host-booking-stats");
      revalidateTag(`booking-${bookingId}`);

      return {
        success: true,
        message: result.message || "Booking cancelled successfully",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to cancel booking",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to cancel booking"
      }`,
    };
  }
}

// Delete booking (admin only)
export async function deleteBooking(bookingId: string): Promise<ApiResponse> {
  try {
    console.log("Deleting booking:", bookingId);

    const response = await serverFetch.delete(`/bookings/${bookingId}`);
    const result = await response.json();

    console.log("Delete booking response:", result);

    if (result.success) {
      // Revalidate relevant cache tags
      revalidateTag("all-bookings");
      revalidateTag("my-bookings");
      revalidateTag("host-bookings");
      revalidateTag("my-booking-stats");
      revalidateTag("host-booking-stats");

      return {
        success: true,
        message: result.message || "Booking deleted successfully",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to delete booking",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Delete booking error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to delete booking"
      }`,
    };
  }
}

// ==================== STATISTICS SERVICES ====================

// Get user booking statistics
export async function getMyBookingStats(): Promise<ApiResponse<IBookingStats>> {
  try {
    const response = await serverFetch.get(`/bookings/user/stats`, {
      next: {
        tags: ["my-booking-stats"],
        revalidate: 60,
      },
    });

    const result = await response.json();
    console.log("Get booking stats response:", result);

    if (result.success) {
      return {
        success: true,
        data: result.data as IBookingStats,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to fetch booking statistics",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Get booking stats error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch booking statistics"
      }`,
    };
  }
}

// Get host booking statistics
export async function getHostBookingStats(): Promise<
  ApiResponse<IBookingStats>
> {
  try {
    const response = await serverFetch.get(`/bookings/host/stats`, {
      next: {
        tags: ["host-booking-stats"],
        revalidate: 60,
      },
    });

    const result = await response.json();
    console.log("Get host booking stats response:", result);

    if (result.success) {
      return {
        success: true,
        data: result.data as IBookingStats,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to fetch host booking statistics",
      data: result.data,
    };
  } catch (error: any) {
    console.error("Get host booking stats error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch host booking statistics"
      }`,
    };
  }
}

// ==================== UTILITY SERVICES ====================

// Check booking availability for a tour
export async function checkBookingAvailability(
  tourId: string,
  numberOfPeople: number
): Promise<
  ApiResponse<{ available: boolean; message: string; availableSpots: number }>
> {
  try {
    console.log(
      "Checking availability for tour:",
      tourId,
      "people:",
      numberOfPeople
    );

    const response = await serverFetch.get(`/tours/${tourId}`);
    const result = await response.json();

    console.log("Tour data response:", result);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Tour not found",
      };
    }

    const tour = result.data;
    const availableSpots = tour.maxGroupSize - (tour.currentGroupSize || 0);
    const isAvailable = tour.isActive && availableSpots >= numberOfPeople;

    return {
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable
          ? `${availableSpots} spots available`
          : `Only ${availableSpots} spots available (requested: ${numberOfPeople})`,
        availableSpots,
      },
    };
  } catch (error: any) {
    console.error("Check booking availability error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to check availability"
      }`,
    };
  }
}

// Calculate booking total amount
export async function calculateBookingTotal(
  tourId: string,
  numberOfPeople: number
): Promise<ApiResponse<{ totalAmount: number }>> {
  try {
    console.log(
      "Calculating total for tour:",
      tourId,
      "people:",
      numberOfPeople
    );

    const response = await serverFetch.get(`/tours/${tourId}`);
    const result = await response.json();

    console.log("Tour price response:", result);

    if (!result.success || !result.data) {
      return {
        success: false,
        message: "Tour not found",
      };
    }

    const tour = result.data;
    const totalAmount = tour.price * numberOfPeople;

    return {
      success: true,
      data: {
        totalAmount,
      },
    };
  } catch (error: any) {
    console.error("Calculate booking total error:", error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to calculate total"
      }`,
    };
  }
}