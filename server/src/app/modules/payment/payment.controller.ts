// payment.controller.ts - UPDATED VERSION
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";

import config from "../../config";
import { stripe } from "../../helper/stripe";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  
  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  
  try {
    // Use raw body for webhook verification
    const rawBody = (req as any).rawBody || req.body;
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      config.stripeWebhookSecret as string
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    const result = await PaymentService.handleStripeWebhookEvent(event);
    
    // Return a response to acknowledge receipt of the event
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Webhook processed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error("⚠️ Error processing webhook:", error);
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: 'Error processing webhook',
      error: error.message,
    });
  }
});

// Create payment intent for booking
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, amount, currency = 'usd' } = req.body;
  const user = req.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if booking exists and belongs to user
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tourist: true }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.tourist.email !== user.email) {
    throw new Error('You are not authorized to pay for this booking');
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      bookingId,
      touristId: booking.touristId,
      touristEmail: booking.tourist.email,
      tourId: booking.tourId
    },
    description: `Payment for booking ${bookingId}`
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: booking.tourist.userId,
      bookingId,
      amount,
      currency: currency.toUpperCase(),
      paymentMethod: 'STRIPE',
      status: 'PENDING',
      transactionId: paymentIntent.id,
      paymentGateway: 'stripe',
      gatewayResponse: paymentIntent
    }
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment intent created successfully',
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    }
  });
});

// Create payment intent for subscription
const createSubscriptionPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionPlanId } = req.body;
  const user = req.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get host
  const host = await prisma.host.findUnique({
    where: { email: user.email },
    include: { user: true }
  });

  if (!host) {
    throw new Error('Host not found');
  }

  // Get subscription plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscriptionPlanId }
  });

  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  if (plan.price === 0) {
    throw new Error('This is a free plan, no payment required');
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(plan.price * 100),
    currency: 'usd',
    metadata: {
      hostId: host.id,
      hostEmail: host.email,
      planId: plan.id,
      planName: plan.name
    },
    description: `Payment for ${plan.name} subscription`
  });

  // Create subscription with pending status
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.duration);

  const subscription = await prisma.subscription.create({
    data: {
      hostId: host.id,
      planId: plan.id,
      startDate,
      endDate,
      status: 'PENDING',
      autoRenew: true,
      tourLimit: plan.tourLimit,
      remainingTours: plan.tourLimit,
      blogPostsAllowed: plan.canWriteBlogs,
      remainingBlogPosts: plan.maxBlogPosts || 0
    }
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: host.userId,
      subscriptionId: subscription.id,
      subscriptionPlanId: plan.id,
      amount: plan.price,
      currency: 'USD',
      paymentMethod: 'STRIPE',
      status: 'PENDING',
      transactionId: paymentIntent.id,
      paymentGateway: 'stripe',
      gatewayResponse: paymentIntent
    }
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subscription payment intent created',
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      subscriptionId: subscription.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    }
  });
});

// Get payment status
const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const user = req.user;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          tour: {
            select: {
              title: true,
              destination: true
            }
          }
        }
      },
      subscription: {
        include: {
          plan: {
            select: {
              name: true,
              tourLimit: true
            }
          }
        }
      }
    }
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Check authorization
  if (payment.userId !== user?.userId) {
    throw new Error('You are not authorized to view this payment');
  }

  // If using Stripe, get latest status
  if (payment.paymentGateway === 'stripe' && payment.transactionId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);
      payment.status = paymentIntent.status === 'succeeded' ? 'PAID' : payment.status;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment status retrieved',
    data: payment
  });
});

export const PaymentController = {
  handleStripeWebhookEvent,
  createPaymentIntent,
  createSubscriptionPaymentIntent,
  getPaymentStatus
};