import { Request } from "express";

import bcrypt from "bcryptjs";

import { fileUploader } from "../../helper/fileUploader";

import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IJWTPayload } from "../../types/common";

import { Admin, Host, Prisma, UserRole, UserStatus } from "@prisma/client";
import envVars from "../../config/env";
import { prisma } from "../../shared/prisma";

const createTourist = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.tourist.profilePhoto = uploadResult?.secure_url;
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    envVars.BCRYPT_SALT_ROUND
  );

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: req.body.tourist.email,
        password: hashPassword,
        role: UserRole.TOURIST, // Add role
      },
    });

    return await tnx.tourist.create({
      data: req.body.tourist,
    });
  });

  return result;
};

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    envVars.BCRYPT_SALT_ROUND
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createHosts = async (req: Request): Promise<Host> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.host.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    envVars.BCRYPT_SALT_ROUND
  );

  const userData = {
    email: req.body.host.email,
    password: hashedPassword,
    role: UserRole.HOST,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdHostData = await transactionClient.host.create({
      data: req.body.host,
    });

    return createdHostData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  // Add default filter for non-deleted users if not specified
  if (!filterData.status) {
    andConditions.push({
      status: UserStatus.ACTIVE,
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      // Include related data
      admin: true,
      host: true,
      tourist: true,
    },
  });

  const total = await prisma.user.count({
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

const getMyProfile = async (user: IJWTPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileData;

  if (userInfo.role === UserRole.TOURIST) {
    profileData = await prisma.tourist.findUnique({
      // Changed from user to tourist
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.HOST) {
    profileData = await prisma.host.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return {
    ...userInfo,
    ...profileData,
  };
};
const changeProfileStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return updateUserStatus;
};

const updateMyProfile = async (user: IJWTPayload, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file;
  const updateData = { ...req.body };

  // Handle visitedLocations if it's a string (might come from form data as string)
  if (userInfo.role === UserRole.HOST && typeof updateData.visitedLocations === 'string') {
    try {
      updateData.visitedLocations = JSON.parse(updateData.visitedLocations);
    } catch (error) {
      // If parsing fails, keep as is or set to empty array
      updateData.visitedLocations = [];
    }
  }

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    updateData.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  } else if (userInfo.role === UserRole.HOST) {
    profileInfo = await prisma.host.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  } else if (userInfo.role === UserRole.TOURIST) {
    profileInfo = await prisma.tourist.update({
      where: {
        email: userInfo.email,
      },
      data: updateData,
    });
  }
  console.log(profileInfo);
  

  return { ...profileInfo };
};
// Update export
export const UserService = {
  createTourist,
  createAdmin,
  createHosts,
  getAllFromDB,
  getMyProfile,
  changeProfileStatus,
  updateMyProfile,
};
