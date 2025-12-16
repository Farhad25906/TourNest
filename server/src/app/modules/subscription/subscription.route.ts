import express, { NextFunction, Request, Response } from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidation } from './subscription.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Stripe webhook (must be raw body parser)
router.post(
  '/stripe-webhook',
  express.raw({ type: 'application/json' }),
  SubscriptionController.handleStripeWebhook
);

// Public routes
router.get('/plans', SubscriptionController.getAllSubscriptionPlans);
router.get('/plans/:id', SubscriptionController.getSingleSubscriptionPlan);

// Host routes
router.post(
  '/subscribe',
  auth(UserRole.HOST),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SubscriptionValidation.createSubscriptionValidationSchema.parse(req.body);
    return SubscriptionController.createSubscription(req, res, next);
  }
);

router.get(
  '/my-subscription',
  auth(UserRole.HOST),
  SubscriptionController.getCurrentSubscription
);

router.get(
  '/verify-session/:sessionId',
  auth(UserRole.HOST),
  SubscriptionController.verifyCheckoutSession
);

router.get(
  '/customer-portal',
  auth(UserRole.HOST),
  SubscriptionController.createCustomerPortalSession
);

router.post(
  '/cancel',
  auth(UserRole.HOST),
  SubscriptionController.cancelSubscription
);

// Admin routes
router.post(
  '/initialize-plans',
  auth(UserRole.ADMIN),
  SubscriptionController.initializeDefaultPlans
);

router.post(
  '/create-plan',
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SubscriptionValidation.createSubscriptionPlanValidationSchema.parse(req.body);
    return SubscriptionController.createSubscriptionPlan(req, res, next);
  }
);

router.patch(
  '/plans/:id',
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SubscriptionValidation.updateSubscriptionPlanValidationSchema.parse(req.body);
    return SubscriptionController.updateSubscriptionPlan(req, res, next);
  }
);

router.delete(
  '/plans/:id',
  auth(UserRole.ADMIN),
  SubscriptionController.deleteSubscriptionPlan
);

router.get(
  '/',
  auth(UserRole.ADMIN),
  SubscriptionController.getAllSubscriptions
);

router.get(
  '/analytics',
  auth(UserRole.ADMIN),
  SubscriptionController.getSubscriptionAnalytics
);

export const subscriptionRoutes = router;