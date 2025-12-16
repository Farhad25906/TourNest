import { Request } from "express";
import { Booking, Prisma, BookingStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import {
  bookingSearchableFields,
  bookingPopulateFields,
} from "./booking.constant";
import { IJWTPayload } from "../../types/common";

const createBooking = async (req: Request): Promise<Booking> => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { tourist: true },
  });

  if (!user || !user.tourist) {
    throw new Error("User not found or not a tourist");
  }

  const {
    tourId,
    numberOfPeople,
    totalAmount,
    specialRequests,
    status,
    paymentStatus,
  } = req.body;

  // Get tour info
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
  });

  if (!tour) {
    throw new Error("Tour not found");
  }

  // Check if user already has a booking for this tour
  const existingBooking = await prisma.booking.findFirst({
    where: {
      tourId,
      userId: user.id,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
  });

  if (existingBooking) {
    throw new Error("You already have a booking for this tour");
  }

  // Create booking with correct schema fields
  const bookingData = {
    userId: user.id,
    touristId: user.tourist.id,
    tourId,
    numberOfPeople: numberOfPeople,
    totalAmount: totalAmount,
    specialRequests,
    status: status || "PENDING",
    paymentStatus: paymentStatus || "PENDING",
    isReviewed: false,
    bookingDate: new Date(),
  };

  console.log("Booking data to create:", bookingData);

  const result = await prisma.$transaction(async (tx) => {
    // Create the booking
    const booking = await tx.booking.create({
      data: bookingData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tourist: {
          select: {
            id: true,
            name: true,
          },
        },
        tour: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
      },
    });

    // Update tour's current group size only if booking is confirmed
    if (booking.status === "CONFIRMED") {
      await tx.tour.update({
        where: { id: tourId },
        data: {
          currentGroupSize: {
            increment: numberOfPeople,
          },
        },
      });
    }

    return booking;
  });

  return result;
};

const getAllBookings = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, startDate, endDate, ...filterData } =
    params;

  const andConditions: Prisma.BookingWhereInput[] = [];

  // Search term filter
  if (searchTerm) {
    andConditions.push({
      OR: bookingSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ totalPrice: priceCondition });
  }

  // Date range filter
  if (startDate) {
    andConditions.push({
      bookingDate: {
        gte: new Date(startDate),
      },
    });
  }

  if (endDate) {
    andConditions.push({
      bookingDate: {
        lte: new Date(endDate),
      },
    });
  }

  // Other filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: bookingPopulateFields,
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getMyBookings = async (req: Request, params: any, options: IOptions) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, startDate, endDate, ...filterData } =
    params;

  const andConditions: Prisma.BookingWhereInput[] = [
    { userId: user.id }, // Filter by current user's ID
  ];

  // Add other filters
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          tour: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          tour: {
            destination: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ totalPrice: priceCondition });
  }

  // Date range filter
  if (startDate) {
    andConditions.push({
      bookingDate: {
        gte: new Date(startDate),
      },
    });
  }

  if (endDate) {
    andConditions.push({
      bookingDate: {
        lte: new Date(endDate),
      },
    });
  }

  // Status filter
  if (filterData.status) {
    andConditions.push({ status: filterData.status });
  }

  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      ...bookingPopulateFields,
      tour: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getHostBookings = async (
  req: Request,
  params: any,
  options: IOptions
) => {
  const hostEmail = req.user?.email;

  if (!hostEmail) {
    throw new Error("Host email not found");
  }

  const host = await prisma.host.findUnique({
    where: { email: hostEmail },
  });

  if (!host) {
    throw new Error("Host not found");
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, minPrice, maxPrice, startDate, endDate, ...filterData } =
    params;

  const andConditions: Prisma.BookingWhereInput[] = [
    {
      tour: {
        hostId: host.id,
      },
    },
  ];

  // Add other filters
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          tour: {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition.gte = Number(minPrice);
    if (maxPrice !== undefined) priceCondition.lte = Number(maxPrice);
    andConditions.push({ totalPrice: priceCondition });
  }

  // Date range filter
  if (startDate) {
    andConditions.push({
      bookingDate: {
        gte: new Date(startDate),
      },
    });
  }

  if (endDate) {
    andConditions.push({
      bookingDate: {
        lte: new Date(endDate),
      },
    });
  }

  // Status filter
  if (filterData.status) {
    andConditions.push({ status: filterData.status });
  }

  const whereConditions: Prisma.BookingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      ...bookingPopulateFields,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          tourist: {
            select: {
              phone: true,
              location: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.booking.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleBooking = async (id: string, user: IJWTPayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      ...bookingPopulateFields,
      tour: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              phone: true,
              bio: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Authorization check
  const userData = await prisma.user.findUnique({
    where: { email: user.email },
    include: { tourist: true, host: true },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const isAdmin = userData.role === "ADMIN";
  const isBookingOwner = booking.userId === userData.id;
  const isHostOwner = userData.host?.id === booking.tour.hostId;

  if (!isAdmin && !isBookingOwner && !isHostOwner) {
    throw new Error("You are not authorized to view this booking");
  }

  return booking;
};

const updateBooking = async (
  id: string,
  user: IJWTPayload,
  updateData: any
) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tour: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Authorization check
  const userData = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const isAdmin = userData.role === "ADMIN";
  const isBookingOwner = booking.userId === userData.id;

  if (!isAdmin && !isBookingOwner) {
    throw new Error("You are not authorized to update this booking");
  }

  // Check if booking can be updated
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new Error(`Cannot update a ${booking.status.toLowerCase()} booking`);
  }

  // Handle participants change
  if (
    updateData.participants &&
    updateData.participants !== booking.participants
  ) {
    const participantsChange = updateData.participants - booking.participants;

    // Check if tour has enough capacity
    const tour = await prisma.tour.findUnique({
      where: { id: booking.tourId },
    });

    if (!tour) {
      throw new Error("Tour not found");
    }

    const currentBookings = await prisma.booking.findMany({
      where: {
        tourId: booking.tourId,
        status: "CONFIRMED",
        id: { not: booking.id },
      },
    });

    const totalConfirmedParticipants = currentBookings.reduce(
      (sum, b) => sum + b.participants,
      0
    );

    if (
      totalConfirmedParticipants + updateData.participants >
      tour.maxGroupSize
    ) {
      throw new Error(
        `Cannot update to ${updateData.participants} participants. Only ${
          tour.maxGroupSize - totalConfirmedParticipants
        } spots available`
      );
    }

    // Update tour's current group size
    await prisma.tour.update({
      where: { id: booking.tourId },
      data: {
        currentGroupSize: {
          increment: participantsChange,
        },
      },
    });
  }

  const result = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: bookingPopulateFields,
  });

  return result;
};

const updateBookingStatus = async (
  id: string,
  user: IJWTPayload,
  updateData: any
) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tour: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Authorization check - only host of the tour or admin can update status
  const userData = await prisma.user.findUnique({
    where: { email: user.email },
    include: { host: true },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  const isAdmin = userData.role === "ADMIN";
  const isHostOwner = userData.host?.id === booking.tour.hostId;

  if (!isAdmin && !isHostOwner) {
    throw new Error("You are not authorized to update this booking status");
  }

  const result = await prisma.booking.update({
    where: { id },
    data: { status: updateData.status },
    include: bookingPopulateFields,
  });

  return result;
};

const cancelBooking = async (id: string, user: IJWTPayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tour: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Authorization check
  const userData = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!userData) {
    throw new Error('User not found');
  }

  const isAdmin = userData.role === 'ADMIN';
  const isBookingOwner = booking.userId === userData.id;

  if (!isAdmin && !isBookingOwner) {
    throw new Error('You are not authorized to cancel this booking');
  }

  // Check if booking can be cancelled
  if (booking.status === 'CANCELLED') {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'COMPLETED') {
    throw new Error('Cannot cancel a completed booking');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update booking status and payment status
    const updatedBooking = await tx.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED', // or 'CANCELLED' based on your logic
      },
      include: bookingPopulateFields,
    });

    // Decrement tour's current group size if booking was confirmed
    if (booking.status === 'CONFIRMED') {
      await tx.tour.update({
        where: { id: booking.tourId },
        data: {
          currentGroupSize: {
            decrement: booking.numberOfPeople,
          },
        },
      });
    }

    return updatedBooking;
  });

  return result;
};

const deleteBooking = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Decrement tour's current group size if booking was confirmed
    if (booking.status === "CONFIRMED") {
      await tx.tour.update({
        where: { id: booking.tourId },
        data: {
          currentGroupSize: {
            decrement: booking.participants,
          },
        },
      });
    }

    // Delete the booking
    return await tx.booking.delete({
      where: { id },
    });
  });

  return result;
};

const getHostBookingStats = async (req: Request) => {
  const hostEmail = req.user?.email;

  if (!hostEmail) {
    throw new Error("Host email not found");
  }

  const host = await prisma.host.findUnique({
    where: { email: hostEmail },
  });

  if (!host) {
    throw new Error("Host not found");
  }

  // Get all bookings for host's tours
  const bookings = await prisma.booking.findMany({
    where: {
      tour: {
        hostId: host.id,
      },
    },
    include: {
      tour: true,
    },
  });

  // Calculate statistics
  const now = new Date();
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Bookings by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const bookingsByMonth = await prisma.booking.groupBy({
    by: ["bookingDate"],
    where: {
      tour: {
        hostId: host.id,
      },
      bookingDate: {
        gte: sixMonthsAgo,
      },
    },
    _count: {
      _all: true,
    },
    _sum: {
      totalPrice: true,
    },
  });

  // Recent bookings (last 10)
  const recentBookings = bookings
    .sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    )
    .slice(0, 10)
    .map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      participants: booking.participants,
      tourTitle: booking.tour?.title,
      userName: booking.userId, // Would need to join with user table for name
    }));

  // Upcoming bookings
  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED" &&
      new Date(booking.tour?.startDate || now) > now
  ).length;

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    completedBookings,
    totalRevenue,
    upcomingBookings,
    bookingsByMonth: bookingsByMonth.map((item) => ({
      month: item.bookingDate.toISOString().slice(0, 7),
      count: item._count._all,
      revenue: item._sum.totalPrice || 0,
    })),
    recentBookings,
  };
};

const getUserBookingStats = async (req: Request) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    throw new Error("User email not found");
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user's bookings
  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
    },
    include: {
      tour: true,
    },
  });

  // Calculate statistics
  const now = new Date();
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED"
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Upcoming trips
  const upcomingTrips = bookings.filter(
    (booking) =>
      booking.status === "CONFIRMED" &&
      new Date(booking.tour?.startDate || now) > now
  ).length;

  // Past trips
  const pastTrips = bookings.filter(
    (booking) =>
      booking.status === "COMPLETED" ||
      (booking.status === "CONFIRMED" &&
        new Date(booking.tour?.endDate || now) < now)
  ).length;

  // Favorite destination (by number of bookings)
  const destinationCounts = bookings.reduce((acc, booking) => {
    const destination = booking.tour?.destination || "Unknown";
    acc[destination] = (acc[destination] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteDestination = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([destination, count]) => ({ destination, count }))
    .slice(0, 1)[0];

  // Recent bookings
  const recentBookings = bookings
    .sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    )
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      tourTitle: booking.tour?.title,
      destination: booking.tour?.destination,
      bookingDate: booking.bookingDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
    }));

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    completedBookings,
    totalSpent,
    upcomingTrips,
    pastTrips,
    favoriteDestination,
    recentBookings,
  };
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getHostBookings,
  getSingleBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  getHostBookingStats,
  getUserBookingStats,
};
