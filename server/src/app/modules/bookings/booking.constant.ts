export const bookingSearchableFields = ["id", "status", "paymentStatus"];

export const bookingFilterableFields = [
  "searchTerm",
  "status",
  "paymentStatus",
  "userId",
  "touristId",
  "tourId",
  "minPrice",
  "maxPrice",
  "startDate",
  "endDate",
  "isReviewed",
];

export const bookingPopulateFields = {
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
  tourist: {
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
    },
  },
  tour: {
    select: {
      id: true,
      title: true,
      destination: true,
      city: true,
      startDate: true,
      endDate: true,
      price: true,
      images: true,
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      status: true,
      paymentMethod: true,
      transactionId: true,
      paidAt: true,
    },
  },
};