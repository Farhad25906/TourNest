import { Request } from 'express';
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionStatus, 
  PaymentMethod, 
  PaymentStatus, 
  Prisma 
} from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { IOptions, paginationHelper } from '../../helper/paginationHelper';
import { 
  subscriptionPlanSearchableFields, 
  subscriptionSearchableFields, 
  DEFAULT_SUBSCRIPTION_PLANS 
} from './subscription.constant';
import stripeService from '../../shared/stripe';

import { IJWTPayload } from '../../types/common';
import envVars from '../../config/env';

// Initialize default plans with Stripe
const initializeDefaultPlans = async () => {
  try {
    const existingPlans = await prisma.subscriptionPlan.count();
    
    if (existingPlans === 0) {
      console.log('Creating default subscription plans on Stripe...');
      
      for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
        try {
          let stripeProductId = null;
          let stripePriceId = null;

          // Only create Stripe products for paid plans
          if (plan.price > 0) {
            // Create product on Stripe
            const product = await stripeService.stripe.products.create({
              name: plan.name,
              description: plan.description,
              metadata: {
                planType: 'subscription',
                tourLimit: plan.tourLimit.toString(),
                canWriteBlogs: plan.canWriteBlogs.toString(),
              }
            });
            stripeProductId = product.id;

            // Create price on Stripe
            const price = await stripeService.stripe.prices.create({
              product: product.id,
              unit_amount: Math.round(plan.price * 100), // Convert to cents
              currency: 'usd',
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
              metadata: {
                planName: plan.name,
                duration: plan.duration.toString(),
              }
            });
            stripePriceId = price.id;
          }

          // Save to database
          await prisma.subscriptionPlan.create({
            data: {
              ...plan,
              stripeProductId,
              stripePriceId,
            }
          });

          console.log(`✅ Created ${plan.name} plan`);
        } catch (error: any) {
          console.error(`❌ Failed to create ${plan.name} plan:`, error.message);
          // Create without Stripe IDs if Stripe fails
          await prisma.subscriptionPlan.create({
            data: plan
          });
        }
      }
      
      console.log('✅ Default subscription plans initialized');
      return { success: true, message: 'Default plans initialized' };
    }
    
    return { success: true, message: 'Plans already exist' };
  } catch (error: any) {
    console.error('Error initializing plans:', error.message);
    throw new Error(`Failed to initialize plans: ${error.message}`);
  }
};

// Get or create Stripe customer
const getOrCreateStripeCustomer = async (hostEmail: string, hostName: string, hostId: string) => {
  try {
    const host = await prisma.host.findUnique({
      where: { email: hostEmail },
    });

    if (!host) {
      throw new Error('Host not found');
    }

    // Check if host already has a Stripe customer ID
    if (host.stripeCustomerId) {
      try {
        const customer = await stripeService.getStripeCustomer(host.stripeCustomerId);
        return customer.id;
      } catch (error) {
        console.log('Stripe customer not found, creating new one...');
      }
    }

    // Create new Stripe customer
    const customer = await stripeService.createStripeCustomer(hostEmail, hostName, {
      hostId: host.id,
      type: 'host'
    });

    // Update host with Stripe customer ID
    await prisma.host.update({
      where: { id: host.id },
      data: { stripeCustomerId: customer.id }
    });

    return customer.id;
  } catch (error: any) {
    console.error('Error getting/creating Stripe customer:', error.message);
    throw new Error(`Failed to get/create Stripe customer: ${error.message}`);
  }
};

// Create subscription
const createSubscription = async (user: IJWTPayload, planId: string, autoRenew: boolean = true) => {
  try {
    // Find host
    const host = await prisma.host.findUnique({
      where: { email: user.email },
      include: { user: true }
    });

    if (!host) {
      throw new Error('Host not found');
    }

    if (host.user.status !== 'ACTIVE') {
      throw new Error('Host account is not active');
    }

    // Get subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    if (!plan.isActive) {
      throw new Error('This subscription plan is not available');
    }

    // Check for existing active subscription
    const existingActiveSubscription = await prisma.subscription.findFirst({
      where: {
        hostId: host.id,
        status: 'ACTIVE'
      }
    });

    if (existingActiveSubscription && plan.price > 0) {
      throw new Error('You already have an active subscription. Please cancel it first.');
    }

    // For free plan (Basic)
    if (plan.price === 0) {
      return await activateFreeSubscription(host, plan, autoRenew);
    }

    // For paid plans, create Stripe checkout
    if (!plan.stripePriceId) {
      throw new Error('Stripe price not configured for this plan. Please contact support.');
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(host.email, host.name, host.id);

    // Create a pending subscription record
    const pendingSubscription = await prisma.subscription.create({
      data: {
        hostId: host.id,
        planId: plan.id,
        status: 'PENDING',
        autoRenew,
        tourLimit: plan.tourLimit,
        remainingTours: plan.tourLimit,
        blogPostsAllowed: plan.canWriteBlogs,
        blogPostLimit: plan.blogPostLimit,
        remainingBlogPosts: plan.blogPostLimit || 0,
        stripeCustomerId,
      }
    });

    // Create Stripe checkout session
    const checkoutSession = await stripeService.createCheckoutSession(
      stripeCustomerId,
      plan.stripePriceId,
      `${envVars.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${envVars.FRONTEND_URL}/subscription/cancel`,
      {
        hostId: host.id,
        subscriptionId: pendingSubscription.id,
        planId: plan.id,
        planName: plan.name,
        hostEmail: host.email
      }
    );

    // Update subscription with Stripe session ID
    await prisma.subscription.update({
      where: { id: pendingSubscription.id },
      data: { 
        stripeSubscriptionId: checkoutSession.subscription as string 
      }
    });

    return {
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      subscriptionId: pendingSubscription.id,
      message: 'Redirect to Stripe checkout to complete payment'
    };
  } catch (error: any) {
    console.error('Error creating subscription:', error.message);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

// Activate free subscription
const activateFreeSubscription = async (host: any, plan: SubscriptionPlan, autoRenew: boolean) => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for free plan

  const subscription = await prisma.subscription.create({
    data: {
      hostId: host.id,
      planId: plan.id,
      startDate,
      endDate,
      status: 'ACTIVE',
      autoRenew,
      tourLimit: plan.tourLimit,
      remainingTours: plan.tourLimit,
      blogPostsAllowed: plan.canWriteBlogs,
      blogPostLimit: plan.blogPostLimit,
      remainingBlogPosts: plan.blogPostLimit || 0
    },
    include: { plan: true }
  });

  // Update host
  await prisma.host.update({
    where: { id: host.id },
    data: {
      tourLimit: plan.tourLimit,
      currentTourCount: 0,
      subscriptionId: subscription.id
    }
  });

  return {
    success: true,
    subscription,
    message: 'Free subscription activated successfully'
  };
};

// Verify checkout session
const verifyCheckoutSession = async (sessionId: string) => {
  try {
    const session = await stripeService.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    // Find subscription by session ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId: session.subscription as string },
          { id: session.metadata?.subscriptionId }
        ]
      },
      include: {
        plan: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      session,
      subscription,
      paymentStatus: session.payment_status,
      subscriptionStatus: session.subscription?.status,
      customerEmail: session.customer_details?.email,
      verified: session.payment_status === 'paid'
    };
  } catch (error: any) {
    console.error('Error verifying checkout session:', error.message);
    throw new Error(`Failed to verify checkout session: ${error.message}`);
  }
};

// Get current subscription
const getCurrentSubscription = async (hostEmail: string) => {
  try {
    const host = await prisma.host.findUnique({
      where: { email: hostEmail },
      include: { user: true }
    });

    if (!host) {
      throw new Error('Host not found');
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        hostId: host.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true,
        payments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If no active subscription, return basic plan
    if (!subscription) {
      const basicPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: 'Basic' }
      });

      return {
        plan: basicPlan,
        status: 'BASIC',
        isFree: true,
        tourLimit: 4,
        remainingTours: 4 - host.currentTourCount,
        canWriteBlogs: false,
        remainingBlogPosts: 0,
        nextBillingDate: null,
        isActive: false
      };
    }

    // Get Stripe subscription details if available
    let stripeSubscription = null;
    let nextBillingDate = null;
    
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripeService.getStripeSubscription(subscription.stripeSubscriptionId);
        if (stripeSubscription.current_period_end) {
          nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    return {
      ...subscription,
      remainingTours: subscription.tourLimit - host.currentTourCount,
      stripeSubscription,
      nextBillingDate,
      isActive: true
    };
  } catch (error: any) {
    console.error('Error getting current subscription:', error.message);
    throw new Error(`Failed to get current subscription: ${error.message}`);
  }
};

// Create customer portal session
const createCustomerPortalSession = async (hostEmail: string) => {
  try {
    const host = await prisma.host.findUnique({
      where: { email: hostEmail }
    });

    if (!host) {
      throw new Error('Host not found');
    }

    if (!host.stripeCustomerId) {
      throw new Error('No Stripe customer found. Please subscribe first.');
    }

    const session = await stripeService.createBillingPortalSession(
      host.stripeCustomerId,
      `${envVars.FRONTEND_URL}/host/dashboard`
    );

    return {
      portalUrl: session.url
    };
  } catch (error: any) {
    console.error('Error creating customer portal session:', error.message);
    throw new Error(`Failed to create customer portal: ${error.message}`);
  }
};

// Cancel subscription
const cancelSubscription = async (hostEmail: string) => {
  try {
    const host = await prisma.host.findUnique({
      where: { email: hostEmail }
    });

    if (!host) {
      throw new Error('Host not found');
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        hostId: host.id,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // If it's a Stripe subscription, cancel on Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        await stripeService.cancelStripeSubscription(subscription.stripeSubscriptionId);
      } catch (error: any) {
        console.error('Error cancelling Stripe subscription:', error.message);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update subscription to cancelled
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false,
        cancelledAt: new Date()
      }
    });

    // Downgrade host to basic plan
    await prisma.host.update({
      where: { id: host.id },
      data: {
        tourLimit: 4,
        currentTourCount: Math.min(host.currentTourCount, 4),
        subscriptionId: null
      }
    });

    return updatedSubscription;
  } catch (error: any) {
    console.error('Error cancelling subscription:', error.message);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

// Handle Stripe webhook
const handleStripeWebhook = async (payload: string, signature: string) => {
  try {
    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(payload, signature, envVars.STRIPE_WEBHOOK_SECRET);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object);
        break;
      }
      
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      }
      
      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { received: true, eventType: event.type };
  } catch (error: any) {
    console.error('Error handling webhook:', error.message);
    throw new Error(`Webhook handling failed: ${error.message}`);
  }
};

// Webhook handlers
const handleCheckoutCompleted = async (session: any) => {
  const subscriptionId = session.metadata?.subscriptionId;
  
  if (!subscriptionId) {
    console.error('No subscription ID in session metadata');
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 12); // 1 year subscription

  // Update subscription to active
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      startDate,
      endDate,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer
    }
  });

  // Update host
  await prisma.host.update({
    where: { id: subscription.hostId },
    data: {
      tourLimit: subscription.tourLimit,
      currentTourCount: 0,
      subscriptionId: subscription.id
    }
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: subscription.hostId,
      subscriptionId: subscription.id,
      subscriptionPlanId: subscription.planId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() || 'USD',
      paymentMethod: 'STRIPE',
      status: 'COMPLETED',
      stripePaymentIntentId: session.payment_intent,
      stripeInvoiceId: session.invoice,
      transactionId: session.id,
      paymentGateway: 'stripe',
      gatewayResponse: session,
      paidAt: new Date()
    }
  });

  console.log(`✅ Subscription ${subscriptionId} activated`);
};

const handleSubscriptionUpdated = async (subscription: any) => {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: subscription.status === 'active' ? 'ACTIVE' : 
               subscription.status === 'canceled' ? 'CANCELLED' : 
               dbSubscription.status,
        endDate: new Date(subscription.current_period_end * 1000)
      }
    });
    console.log(`✅ Subscription ${dbSubscription.id} updated to ${subscription.status}`);
  }
};

const handleSubscriptionDeleted = async (subscription: any) => {
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        autoRenew: false
      }
    });

    // Downgrade host to basic plan
    await prisma.host.update({
      where: { id: dbSubscription.hostId },
      data: {
        tourLimit: 4,
        currentTourCount: 0,
        subscriptionId: null
      }
    });

    console.log(`✅ Subscription ${dbSubscription.id} cancelled`);
  }
};

const handleInvoicePaymentSucceeded = async (invoice: any) => {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription }
  });

  if (subscription) {
    await prisma.payment.create({
      data: {
        userId: subscription.hostId,
        subscriptionId: subscription.id,
        subscriptionPlanId: subscription.planId,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency?.toUpperCase() || 'USD',
        paymentMethod: 'STRIPE',
        status: 'COMPLETED',
        stripePaymentIntentId: invoice.payment_intent,
        stripeInvoiceId: invoice.id,
        transactionId: `inv_${invoice.id}`,
        paymentGateway: 'stripe',
        gatewayResponse: invoice,
        paidAt: new Date()
      }
    });
    console.log(`✅ Payment recorded for subscription ${subscription.id}`);
  }
};

const handleInvoicePaymentFailed = async (invoice: any) => {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: invoice.subscription }
  });

  if (subscription) {
    await prisma.payment.create({
      data: {
        userId: subscription.hostId,
        subscriptionId: subscription.id,
        subscriptionPlanId: subscription.planId,
        amount: invoice.amount_due / 100,
        currency: invoice.currency?.toUpperCase() || 'USD',
        paymentMethod: 'STRIPE',
        status: 'FAILED',
        stripeInvoiceId: invoice.id,
        transactionId: `inv_${invoice.id}`,
        paymentGateway: 'stripe',
        gatewayResponse: invoice,
        paidAt: null
      }
    });
    console.log(`❌ Payment failed for subscription ${subscription.id}`);
  }
};

// Admin: Get all subscription plans
const getAllSubscriptionPlans = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, ...filterData } = params;

  const andConditions: Prisma.SubscriptionPlanWhereInput[] = [];

  // Show only active plans by default (for non-admin users)
  if (!filterData.showAll) {
    andConditions.push({
      isActive: true
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: subscriptionPlanSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ price: priceCondition });
  }

  // Other filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    });
  }

  const whereConditions: Prisma.SubscriptionPlanWhereInput = 
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.subscriptionPlan.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder
    }
  });

  const total = await prisma.subscriptionPlan.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

// Admin: Get single subscription plan
const getSingleSubscriptionPlan = async (id: string) => {
  const result = await prisma.subscriptionPlan.findUnique({
    where: { id }
  });

  if (!result) {
    throw new Error('Subscription plan not found');
  }

  return result;
};

// Admin: Create subscription plan
const createSubscriptionPlan = async (payload: any): Promise<SubscriptionPlan> => {
  const result = await prisma.subscriptionPlan.create({
    data: payload
  });

  return result;
};

// Admin: Update subscription plan
const updateSubscriptionPlan = async (id: string, payload: any): Promise<SubscriptionPlan> => {
  const result = await prisma.subscriptionPlan.update({
    where: { id },
    data: payload
  });

  return result;
};

// Admin: Delete subscription plan
const deleteSubscriptionPlan = async (id: string) => {
  // Check if any active subscriptions are using this plan
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      planId: id,
      status: 'ACTIVE'
    }
  });

  if (activeSubscriptions > 0) {
    throw new Error('Cannot delete plan with active subscriptions');
  }

  const result = await prisma.subscriptionPlan.delete({
    where: { id }
  });

  return result;
};

// Admin: Get all subscriptions
const getAllSubscriptions = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.SubscriptionWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: subscriptionSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    });
  }

  const whereConditions: Prisma.SubscriptionWhereInput = 
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.subscription.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      host: {
        select: {
          name: true,
          email: true
        }
      },
      plan: true,
      payments: {
        where: {
          status: 'COMPLETED'
        },
        take: 1,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const total = await prisma.subscription.count({
    where: whereConditions
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

// Get subscription analytics for admin
const getSubscriptionAnalytics = async () => {
  const totalSubscriptions = await prisma.subscription.count();
  const activeSubscriptions = await prisma.subscription.count({
    where: { status: 'ACTIVE' }
  });
  const cancelledSubscriptions = await prisma.subscription.count({
    where: { status: 'CANCELLED' }
  });
  const pendingSubscriptions = await prisma.subscription.count({
    where: { status: 'PENDING' }
  });

  // Revenue calculation
  const revenueData = await prisma.payment.aggregate({
    where: {
      status: 'COMPLETED',
      subscriptionId: { not: null }
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  // Subscription by plan
  const subscriptionsByPlan = await prisma.subscription.groupBy({
    by: ['planId'],
    _count: {
      id: true
    },
    where: {
      status: 'ACTIVE'
    }
  });

  // Get plan names
  const planDetails = await Promise.all(
    subscriptionsByPlan.map(async (item) => {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: item.planId },
        select: { name: true, price: true }
      });
      return {
        planId: item.planId,
        planName: plan?.name || 'Unknown',
        planPrice: plan?.price || 0,
        subscriptionCount: item._count.id
      };
    })
  );

  // Monthly revenue
  const monthlyRevenue = await prisma.payment.groupBy({
    by: ['createdAt'],
    _sum: {
      amount: true
    },
    where: {
      status: 'COMPLETED',
      subscriptionId: { not: null },
      createdAt: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return {
    overview: {
      total: totalSubscriptions,
      active: activeSubscriptions,
      cancelled: cancelledSubscriptions,
      pending: pendingSubscriptions
    },
    revenue: {
      total: revenueData._sum.amount || 0,
      totalPayments: revenueData._count.id || 0,
      averagePayment: revenueData._sum.amount && revenueData._count.id 
        ? revenueData._sum.amount / revenueData._count.id 
        : 0
    },
    byPlan: planDetails,
    monthlyRevenue: monthlyRevenue.map(item => ({
      month: item.createdAt.toISOString().split('T')[0],
      revenue: item._sum.amount || 0
    })),
    recentSubscriptions: await prisma.subscription.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: { name: true, email: true }
        },
        plan: {
          select: { name: true, price: true }
        }
      }
    })
  };
};

export const SubscriptionService = {
  // Core subscription functions
  createSubscription,
  verifyCheckoutSession,
  getCurrentSubscription,
  createCustomerPortalSession,
  cancelSubscription,
  handleStripeWebhook,
  
  // Plan management
  initializeDefaultPlans,
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  
  // Admin functions
  getAllSubscriptions,
  getSubscriptionAnalytics,
};