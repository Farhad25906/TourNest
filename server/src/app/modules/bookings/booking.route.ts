import express, { NextFunction, Request, Response } from "express";

import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { BookingValidation } from "./booking.validation";
import { BookingController } from "./booking.controller";
import { checkBookingAvailability } from "../../middlewares/booking.middleware";

const router = express.Router();
const parseQueryParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.minPrice) req.query.minPrice = Number(req.query.minPrice);
  if (req.query.maxPrice) req.query.maxPrice = Number(req.query.maxPrice);
  if (req.query.page) req.query.page = Number(req.query.page);
  if (req.query.limit) req.query.limit = Number(req.query.limit);
  next();
};

// Create a new booking (USER only)
router.post(
  "/",
  auth(UserRole.TOURIST),
  checkBookingAvailability,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = BookingValidation.createBookingValidationSchema.parse(
        req.body
      );
      return BookingController.createBooking(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Get all bookings (ADMIN only)
router.get(
  "/",
  auth(UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery =
        BookingValidation.getBookingsValidationSchema.parse(req.query);
      parseQueryParams;
      return BookingController.getAllBookings(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Get my bookings (TOURIST only)
router.get(
  "/my-bookings",
  auth(UserRole.TOURIST),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery =
        BookingValidation.getBookingsValidationSchema.parse(req.query);
      parseQueryParams;
      return BookingController.getMyBookings(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Get host bookings (HOST only)
router.get(
  "/host/my-bookings",
  auth(UserRole.HOST),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery =
        BookingValidation.getBookingsValidationSchema.parse(req.query);
      req.query = validatedQuery;
      return BookingController.getHostBookings(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Get single booking
router.get(
  "/:id",
  auth(UserRole.TOURIST, UserRole.HOST, UserRole.ADMIN),
  BookingController.getSingleBooking
);

// Update booking (USER who created it or ADMIN)
router.patch(
  "/:id",
  auth(UserRole.TOURIST, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = BookingValidation.updateBookingValidationSchema.parse(
        req.body
      );
      return BookingController.updateBooking(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Update booking status (HOST or ADMIN)
router.patch(
  "/:id/status",
  auth(UserRole.HOST, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = BookingValidation.updateBookingStatusValidationSchema.parse(
        req.body
      );
      return BookingController.updateBookingStatus(req, res, next);
    } catch (error) {
      return next(error);
    }
  }
);

// Cancel booking (USER who created it or ADMIN)
router.patch(
  "/:id/cancel",
  auth(UserRole.TOURIST, UserRole.ADMIN),
  BookingController.cancelBooking
);

// Delete booking (ADMIN only)
router.delete("/:id", auth(UserRole.ADMIN), BookingController.deleteBooking);

// Get booking statistics (HOST or ADMIN)
router.get(
  "/host/stats",
  auth(UserRole.HOST),
  BookingController.getHostBookingStats
);

// Get user booking statistics (USER)
router.get(
  "/user/stats",
  auth(UserRole.TOURIST),
  BookingController.getUserBookingStats
);

export const bookingRoutes = router;
