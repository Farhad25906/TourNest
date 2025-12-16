export const subscriptionPlanSearchableFields = [
  'name',
  'description'
];

export const subscriptionPlanFilterableFields = [
  'searchTerm',
  'minPrice',
  'maxPrice',
  'isActive',
  'canWriteBlogs'
];

export const subscriptionSearchableFields = [
  'status'
];

export const subscriptionFilterableFields = [
  'searchTerm',
  'status',
  'hostId',
  'planId'
];

// Default subscription plans in USD
export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    name: 'Basic',
    description: 'Perfect for new hosts starting out',
    price: 0,
    duration: 12,
    tourLimit: 4,
    canWriteBlogs: false,
    blogPostLimit: 0,
    features: [
      'Create up to 4 tours per year',
      'Basic profile listing',
      'Customer support'
    ],
    isActive: true,
    stripePriceId: null,
    stripeProductId: null,
  },
  {
    name: 'Standard',
    description: 'For growing hosts who want more exposure',
    price: 9.99,
    duration: 1,
    tourLimit: 8,
    canWriteBlogs: true,
    blogPostLimit: 10,
    features: [
      'Create up to 8 tours per year',
      'Write up to 10 blog posts',
      'Featured in search results',
      'Priority customer support',
      'Analytics dashboard'
    ],
    isActive: true,
    stripePriceId: null,
    stripeProductId: null,
  },
  {
    name: 'Premium',
    description: 'For professional hosts seeking maximum exposure',
    price: 19.99,
    duration: 1,
    tourLimit: 12,
    canWriteBlogs: true,
    blogPostLimit: null,
    features: [
      'Create up to 12 tours per year',
      'Write unlimited blog posts',
      'Top placement in search results',
      '24/7 priority support',
      'Advanced analytics',
      'Marketing tools',
      'Custom branding'
    ],
    isActive: true,
    stripePriceId: null,
    stripeProductId: null,
  }
];

// export const SubscriptionStatus = {
//   PENDING: 'PENDING',
//   ACTIVE: 'ACTIVE',
//   CANCELLED: 'CANCELLED',
//   EXPIRED: 'EXPIRED',
//   PAUSED: 'PAUSED',
// } as const;

// export const PaymentStatus = {
//   PENDING: 'PENDING',
//   COMPLETED: 'COMPLETED',
//   FAILED: 'FAILED',
//   REFUNDED: 'REFUNDED',
//   PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
// } as const;

// export const PaymentMethod = {
//   STRIPE: 'STRIPE',
//   BKASH: 'BKASH',
//   NAGAD: 'NAGAD',
//   BANK: 'BANK',
// } as const;