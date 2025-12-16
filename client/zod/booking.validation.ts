import { z } from 'zod';

export const bookingStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
export const paymentStatusEnum = z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED']);

export const createBookingValidationSchema = z.object({
  tourId: z.string().min(1, 'Tour ID is required'),
  numberOfPeople: z
    .number()
    .int()
    .min(1, 'At least 1 person is required')
    .max(100, 'Maximum 100 people allowed'),
  totalAmount: z.number().positive('Total amount must be positive'),
  specialRequests: z.string().optional(),
  status: bookingStatusEnum.optional().default('PENDING'),
  paymentStatus: paymentStatusEnum.optional().default('PENDING'),
});

export const updateBookingValidationSchema = z.object({
  numberOfPeople: z
    .number()
    .int()
    .min(1, 'At least 1 person is required')
    .max(100, 'Maximum 100 people allowed')
    .optional(),
  totalAmount: z.number().positive('Total amount must be positive').optional(),
  specialRequests: z.string().optional(),
  status: bookingStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  isReviewed: z.boolean().optional(),
}).partial();

export const updateBookingStatusValidationSchema = z.object({
  status: bookingStatusEnum,
});

export type BookingStatus = z.infer<typeof bookingStatusEnum>;
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;
export type CreateBookingInput = z.infer<typeof createBookingValidationSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingValidationSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusValidationSchema>;