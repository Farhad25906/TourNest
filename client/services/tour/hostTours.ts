/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";
import { zodValidator } from "@/lib/zodValidator";
import { createTourValidationSchema, updateTourValidationSchema } from "@/zod/tour.validation";
import { 
  ITour, 
  HostTourFilters, 
  HostTourStats, 
  TourFilters,
  ApiResponse 
} from "@/types/tour.interface";

// ==================== CREATE & UPDATE SERVICES ====================

export const createTour = async (_currentState: any, formData: FormData): Promise<ApiResponse<ITour>> => {
  try {
    // Extract and transform form data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      destination: formData.get('destination'),
      city: formData.get('city'),
      country: formData.get('country'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      duration: parseInt(formData.get('duration') as string) || 0,
      price: parseFloat(formData.get('price') as string) || 0,
      maxGroupSize: parseInt(formData.get('maxGroupSize') as string) || 0,
      category: formData.get('category'),
      difficulty: formData.get('difficulty'),
      included: formData.getAll('included').filter(item => item !== '') || [],
      excluded: formData.getAll('excluded').filter(item => item !== '') || [],
      meetingPoint: formData.get('meetingPoint'),
      isActive: formData.get('isActive') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
    };

    // Handle itinerary (JSON string)
    const itinerary = formData.get('itinerary');
    if (itinerary) {
      try {
        rawData.itinerary = JSON.parse(itinerary as string);
      } catch {
        rawData.itinerary = itinerary;
      }
    }

    // Validate data
    const validation = zodValidator(rawData, createTourValidationSchema);
    if (!validation.success) {
      return {
        success: false,
        errors: validation.errors,
        message: "Validation failed"
      };
    }

    const validatedData = validation.data;

    // Prepare form data for upload
    const submitData = new FormData();
    submitData.append("data", JSON.stringify({
      ...validatedData,
      currentGroupSize: 0,
      views: 0
    }));

    // Handle multiple image uploads
    const images = formData.getAll('images');
    images.forEach((image) => {
      if (image instanceof File && image.size > 0) {
        submitData.append(`images`, image);
      }
    });

    // Make API call
    const res = await serverFetch.post("/tour/create-tour", {
      body: submitData,
    });

    const result = await res.json();

    if (result.success) {
      // Revalidate cache
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      revalidateTag('tours-list');
      
      return {
        success: true,
        message: "Tour created successfully!",
        data: result.data
      };
    }

    return result;

  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Tour creation error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : "Failed to create tour. Please try again."}`
    };
  }
};

export const updateTour = async (tourId: string, formData: FormData): Promise<ApiResponse<ITour>> => {
  try {
    // Extract and transform form data
    const rawData: Record<string, any> = {};
    
    // Add optional fields only if they exist in formData
    const fields = [
      'title', 'description', 'destination', 'city', 'country',
      'startDate', 'endDate', 'duration', 'price', 'maxGroupSize',
      'category', 'difficulty', 'meetingPoint',
      'isActive', 'isFeatured'
    ];

    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        if (field === 'duration' || field === 'maxGroupSize') {
          rawData[field] = parseInt(value as string);
        } else if (field === 'price') {
          rawData[field] = parseFloat(value as string);
        } else if (field === 'isActive' || field === 'isFeatured') {
          rawData[field] = value === 'true';
        } else if (field === 'startDate' || field === 'endDate') {
          rawData[field] = (value as string);
        } else {
          rawData[field] = value;
        }
      }
    });

    // Handle included and excluded arrays
    const included = formData.getAll('included');
    if (included.length > 0) {
      rawData.included = included.filter(item => item !== '');
    }

    const excluded = formData.getAll('excluded');
    if (excluded.length > 0) {
      rawData.excluded = excluded.filter(item => item !== '');
    }

    // Handle itinerary (JSON string)
    const itinerary = formData.get('itinerary');
    if (itinerary) {
      try {
        rawData.itinerary = JSON.parse(itinerary as string);
      } catch {
        rawData.itinerary = itinerary;
      }
    }

    // Handle existing images array
    const imagesInput = formData.get('existingImages');
    if (imagesInput) {
      try {
        rawData.images = JSON.parse(imagesInput as string);
      } catch {
        rawData.images = imagesInput;
      }
    }

    // Validate data if there's any data to validate
    if (Object.keys(rawData).length > 0) {
      const validation = zodValidator(rawData, updateTourValidationSchema);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors,
          message: "Validation failed"
        };
      }
    }

    // Prepare form data for upload
    const submitData = new FormData();
    
    // Only append data if there are fields to update
    if (Object.keys(rawData).length > 0) {
      submitData.append("data", JSON.stringify(rawData));
    }

    // Handle new image uploads
    const newImages = formData.getAll('newImages');
    newImages.forEach((image) => {
      if (image instanceof File && image.size > 0) {
        submitData.append(`images`, image);
      }
    });

    // Make API call for update
    const res = await serverFetch.patch(`/tour/${tourId}`, {
      body: submitData,
    });

    const result = await res.json();

    if (result.success) {
      // Revalidate cache
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      revalidateTag(`my-tour-${tourId}`);
      revalidateTag('tours-list');
      
      return {
        success: true,
        message: "Tour updated successfully!",
        data: result.data
      };
    }

    return result;

  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Tour update error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : "Failed to update tour. Please try again."}`
    };
  }
};

// ==================== GET & DELETE SERVICES ====================

// Get all public tours
export async function getAllTours(filters?: TourFilters): Promise<ApiResponse<ITour[]>> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    // Set default values
    if (!filters?.page) queryParams.append('page', '1');
    if (!filters?.limit) queryParams.append('limit', '12');
    if (!filters?.sortBy) queryParams.append('sortBy', 'createdAt');
    if (!filters?.sortOrder) queryParams.append('sortOrder', 'desc');

    const queryString = queryParams.toString();
    
    const response = await serverFetch.get(`/tour${queryString ? `?${queryString}` : ""}`, {
      next: {
        tags: ["tours-list"],
        revalidate: 60,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data : [],
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Get all tours error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch tours'}`
    };
  }
}

// Get single tour by ID
export async function getSingleTour(tourId: string): Promise<ApiResponse<ITour>> {
  try {
    const response = await serverFetch.get(`/tour/${tourId}`, {
      next: {
        tags: [`tour-${tourId}`],
        revalidate: 60,
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        data: result.data as ITour,
      };
    }
    
    return result;
  } catch (error: any) {
    console.error("Get single tour error:", error);
    return {
      success: false,
      data: null,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch tour details'}`
    };
  }
}

// Delete tour by ID
export async function deleteTour(tourId: string): Promise<ApiResponse> {
  try {
    const response = await serverFetch.delete(`/tour/${tourId}`);
    const result = await response.json();

    if (result.success) {
      // Revalidate relevant cache tags
      revalidateTag('tours-list');
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      revalidateTag(`tour-${tourId}`);
      
      return {
        success: true,
        message: result.message || "Tour deleted successfully",
        data: result.data
      };
    }

    return result;
  } catch (error: any) {
    console.error("Delete tour error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete tour'}`
    };
  }
}

// ==================== HOST-SPECIFIC SERVICES ====================

// Get tours created by the authenticated host
export async function getMyTours(filters?: HostTourFilters): Promise<ApiResponse<ITour[]>> {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    
    const response = await serverFetch.get(`/tour/host/my-tours${queryString ? `?${queryString}` : ""}`, {
      next: {
        tags: ["my-tours"],
        revalidate: 30,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data as ITour[] : [],
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Get my tours error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch your tours'}`
    };
  }
}

// Get host tour statistics
export async function getMyTourStats(): Promise<ApiResponse<HostTourStats>> {
  try {
    const response = await serverFetch.get(`/tour/host/stats`, {
      next: {
        tags: ["my-tour-stats"],
        revalidate: 60,
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        data: result.data as HostTourStats,
      };
    }
    
    return result;
  } catch (error: any) {
    console.error("Get tour stats error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch tour statistics'}`
    };
  }
}

// Get single tour (host view - with booking info)
export async function getMyTourDetails(tourId: string): Promise<ApiResponse<ITour & { bookingStats?: any }>> {
  try {
    const response = await serverFetch.get(`/tour/host/my-tours/${tourId}`, {
      next: {
        tags: [`my-tour-${tourId}`],
        revalidate: 60,
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        data: result.data as ITour & { bookingStats?: any },
      };
    }
    
    return result;
  } catch (error: any) {
    console.error("Get tour details error:", error);
    return {
      success: false,
      data: null,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch tour details'}`
    };
  }
}

// Update tour status (active/inactive)
export async function updateTourStatus(tourId: string, isActive: boolean): Promise<ApiResponse> {
  try {
    const response = await serverFetch.patch(`/tour/${tourId}`, {
      body: JSON.stringify({ isActive }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      // Revalidate cache
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      revalidateTag(`my-tour-${tourId}`);
      revalidateTag('tours-list');
      
      return {
        success: true,
        message: `Tour ${isActive ? 'activated' : 'deactivated'} successfully!`,
        data: result.data
      };
    }

    return result;
  } catch (error: any) {
    console.error("Update tour status error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to update tour status'}`
    };
  }
}

// Update tour featured status
export async function updateTourFeatured(tourId: string, isFeatured: boolean): Promise<ApiResponse> {
  try {
    const response = await serverFetch.patch(`/tour/${tourId}`, {
      body: JSON.stringify({ isFeatured }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      // Revalidate cache
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      revalidateTag(`my-tour-${tourId}`);
      
      return {
        success: true,
        message: `Tour ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully!`,
        data: result.data
      };
    }

    return result;
  } catch (error: any) {
    console.error("Update tour featured error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to update tour featured status'}`
    };
  }
}

// Quick tour actions (duplicate, archive, etc.)
export async function duplicateTour(tourId: string): Promise<ApiResponse> {
  try {
    // First get the tour to duplicate
    const tourResponse = await getMyTourDetails(tourId);
    
    if (!tourResponse.success || !tourResponse.data) {
      return tourResponse;
    }

    const tour = tourResponse.data;
    
    // Create a duplicate with "- Copy" suffix
    const duplicateData = {
      title: `${tour.title} - Copy`,
      description: tour.description,
      destination: tour.destination,
      city: tour.city,
      country: tour.country,
      startDate: tour.startDate,
      endDate: tour.endDate,
      duration: tour.duration,
      price: tour.price,
      maxGroupSize: tour.maxGroupSize,
      category: tour.category,
      difficulty: tour.difficulty,
      included: tour.included,
      excluded: tour.excluded,
      itinerary: tour.itinerary,
      meetingPoint: tour.meetingPoint,
      images: tour.images,
      isActive: false, // Start as inactive
      isFeatured: false,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(duplicateData));

    const response = await serverFetch.post("/tour/create-tour", {
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Revalidate cache
      revalidateTag('my-tours');
      revalidateTag('my-tour-stats');
      
      return {
        success: true,
        message: "Tour duplicated successfully!",
        data: result.data
      };
    }

    return result;
  } catch (error: any) {
    console.error("Duplicate tour error:", error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to duplicate tour'}`
    };
  }
}

// Get featured tours
export async function getFeaturedTours(limit: number = 6): Promise<ApiResponse<ITour[]>> {
  try {
    const response = await serverFetch.get(`/tour?isFeatured=true&limit=${limit}&sortBy=createdAt&sortOrder=desc`, {
      next: {
        tags: ["featured-tours"],
        revalidate: 180,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data as ITour[] : [],
    };
  } catch (error: any) {
    console.error("Get featured tours error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch featured tours'}`
    };
  }
}

// Get tours by category
export async function getToursByCategory(category: string, limit?: number): Promise<ApiResponse<ITour[]>> {
  try {
    let url = `/tour?category=${category}&isActive=true`;
    if (limit) {
      url += `&limit=${limit}`;
    }
    
    const response = await serverFetch.get(url, {
      next: {
        tags: [`tours-category-${category}`],
        revalidate: 120,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data as ITour[] : [],
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Get tours by category error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch tours by category'}`
    };
  }
}

// Search tours
export async function searchTours(query: string, filters?: TourFilters): Promise<ApiResponse<ITour[]>> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('searchTerm', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const response = await serverFetch.get(`/tour?${queryParams.toString()}`, {
      next: {
        tags: ["search-tours"],
        revalidate: 60,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data as ITour[] : [],
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Search tours error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to search tours'}`
    };
  }
}

// Get upcoming tours
export async function getUpcomingTours(limit?: number): Promise<ApiResponse<ITour[]>> {
  try {
    let url = `/tour?isActive=true&sortBy=startDate&sortOrder=asc`;
    if (limit) {
      url += `&limit=${limit}`;
    }
    
    const response = await serverFetch.get(url, {
      next: {
        tags: ["upcoming-tours"],
        revalidate: 120,
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: Array.isArray(result.data) ? result.data as ITour[] : [],
      meta: result.meta,
    };
  } catch (error: any) {
    console.error("Get upcoming tours error:", error);
    return {
      success: false,
      data: [],
      message: `${process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch upcoming tours'}`
    };
  }
}