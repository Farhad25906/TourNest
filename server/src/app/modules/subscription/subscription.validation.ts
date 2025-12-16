import z from "zod";

// Create subscription plan validation
const createSubscriptionPlanValidationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  price: z.number().min(0, "Price must be at least 0"),
  duration: z.number().int().min(1, "Duration must be at least 1 month"),
  tourLimit: z.number().int().min(1, "Tour limit must be at least 1"),
  canWriteBlogs: z.boolean(),
  blogPostLimit: z.number().int().min(0).nullable().optional(),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  isActive: z.boolean().optional().default(true),
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
});

// Update subscription plan validation
const updateSubscriptionPlanValidationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  description: z.string().min(1, "Description is required").max(500, "Description too long").optional(),
  price: z.number().min(0, "Price must be at least 0").optional(),
  duration: z.number().int().min(1, "Duration must be at least 1 month").optional(),
  tourLimit: z.number().int().min(1, "Tour limit must be at least 1").optional(),
  canWriteBlogs: z.boolean().optional(),
  blogPostLimit: z.number().int().min(0).nullable().optional(),
  features: z.array(z.string()).min(1, "At least one feature is required").optional(),
  isActive: z.boolean().optional(),
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
}).partial();

// Create subscription validation
const createSubscriptionValidationSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  autoRenew: z.boolean().optional().default(true),
});

// Process payment validation
const processPaymentValidationSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  paymentMethod: z.enum(["STRIPE", "BKASH", "NAGAD", "BANK"]),
  cardNumber: z.string().optional(),
  cardExpMonth: z.number().min(1).max(12).optional(),
  cardExpYear: z.number().min(2023).optional(),
  cardCvc: z.string().length(3).optional(),
  phoneNumber: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === "STRIPE") {
    return !!data.cardNumber && !!data.cardExpMonth && !!data.cardExpYear && !!data.cardCvc;
  }
  if (data.paymentMethod === "BKASH" || data.paymentMethod === "NAGAD") {
    return !!data.phoneNumber;
  }
  return true;
}, {
  message: "Missing required fields for selected payment method"
});

// Status update validation
const updateStatusValidationSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "CANCELLED", "EXPIRED", "PAUSED"]),
});

export const SubscriptionValidation = {
  createSubscriptionPlanValidationSchema,
  updateSubscriptionPlanValidationSchema,
  createSubscriptionValidationSchema,
  processPaymentValidationSchema,
  updateStatusValidationSchema,
};