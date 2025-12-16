import { z } from 'zod';
import { CATEGORIES, DIFFICULTIES } from '@/types/tour.interface';

// Create schema for reuse
const tourBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
  destination: z.string().min(1, 'Destination is required').max(100, 'Destination is too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name is too long'),
  country: z.string().min(1, 'Country is required').max(50, 'Country name is too long'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  duration: z.number().int().positive('Duration must be positive').max(365, 'Duration cannot exceed 365 days'),
  price: z.number().positive('Price must be positive').max(1000000, 'Price is too high'),
  maxGroupSize: z.number().int().min(1, 'Max group size must be at least 1').max(100, 'Max group size cannot exceed 100'),
  category: z.enum(CATEGORIES),
  difficulty: z.enum(DIFFICULTIES),
  included: z.array(z.string()).optional().default([]),
  excluded: z.array(z.string()).optional().default([]),
  itinerary: z.any().optional().nullable(),
  meetingPoint: z.string().min(1, 'Meeting point is required').max(500, 'Meeting point is too long'),
  images: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

// Create tour validation schema
export const createTourValidationSchema = tourBaseSchema
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"]
  })
  .transform(data => ({
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  }));

// Update tour validation schema (all fields optional)
export const updateTourValidationSchema = tourBaseSchema
  .partial()
  .refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  }, {
    message: "End date must be after start date",
    path: ["endDate"]
  })
  .transform(data => {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return data;
  });