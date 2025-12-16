// subscription.middleware.ts (updated)
import { Request, Response, NextFunction } from "express";
import { prisma } from "../shared/prisma";
import catchAsync from "../shared/catchAsync";

export const checkTourCreationLimit = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hostEmail = req.user?.email;

    if (!hostEmail) {
      return res.status(401).json({
        success: false,
        message: "Host not authenticated",
      });
    }

    const host = await prisma.host.findUnique({
      where: { email: hostEmail },
    });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    // Check if host has reached tour limit
    if (host.currentTourCount >= host.tourLimit) {
      // Check if host has an active subscription
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          hostId: host.id,
          status: "ACTIVE",
        },
        include: { plan: true },
      });

      if (!activeSubscription) {
        return res.status(403).json({
          success: false,
          message: `You have reached your tour creation limit (${host.tourLimit}). Please subscribe to a plan.`,
          data: {
            currentTourCount: host.currentTourCount,
            tourLimit: host.tourLimit,
            remainingTours: 0,
            needsSubscription: true,
          },
        });
      }

      return res.status(403).json({
        success: false,
        message: `You have reached your tour creation limit (${host.tourLimit}). Please upgrade your plan.`,
        data: {
          currentTourCount: host.currentTourCount,
          tourLimit: host.tourLimit,
          remainingTours: 0,
          currentPlan: activeSubscription.plan.name,
          needsUpgrade: true,
        },
      });
    }

    // Use Object.defineProperty to safely add the property
    Object.defineProperty(req, 'host', {
      value: host,
      writable: true,
      configurable: true,
      enumerable: true
    });
    
    next();
  }
);

export const checkBlogCreationPermission = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const hostEmail = req.user?.email;

    if (!hostEmail) {
      return res.status(401).json({
        success: false,
        message: "Host not authenticated",
      });
    }

    const host = await prisma.host.findUnique({
      where: { email: hostEmail },
    });

    if (!host) {
      return res.status(404).json({
        success: false,
        message: "Host not found",
      });
    }

    // Check if host can write blogs
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        hostId: host.id,
        status: "ACTIVE",
      },
      include: { plan: true },
    });

    if (!activeSubscription || !activeSubscription.plan.canWriteBlogs) {
      return res.status(403).json({
        success: false,
        message:
          "You need a Standard or Premium subscription to write blog posts.",
        data: {
          canWriteBlogs: false,
          currentPlan: activeSubscription?.plan.name || "Basic",
          needsUpgrade: true,
        },
      });
    }

    // Check blog post limit if applicable
    if (activeSubscription.plan.blogPostLimit !== null) {
      // Get current blog count
      const currentBlogCount = await prisma.blog.count({
        where: {
          hostId: host.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1), // From start of year
          },
        },
      });

      if (currentBlogCount >= activeSubscription.plan.blogPostLimit) {
        return res.status(403).json({
          success: false,
          message: `You have reached your annual blog post limit (${activeSubscription.plan.blogPostLimit}).`,
          data: {
            currentBlogCount,
            blogPostLimit: activeSubscription.plan.blogPostLimit,
            remainingBlogPosts: 0,
          },
        });
      }
    }

    // Use Object.defineProperty for both properties
    Object.defineProperty(req, 'host', {
      value: host,
      writable: true,
      configurable: true,
      enumerable: true
    });
    
    Object.defineProperty(req, 'subscription', {
      value: activeSubscription,
      writable: true,
      configurable: true,
      enumerable: true
    });
    
    next();
  }
);