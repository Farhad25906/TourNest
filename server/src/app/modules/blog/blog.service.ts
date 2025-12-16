import { Request } from "express";
import { Prisma } from "@prisma/client";
import { fileUploader } from "../../helper/fileUploader";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { blogSearchableFields } from "./blog.constant";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";

const createBlog = async (user: IJWTPayload, req: Request) => {
  // Check if host has active subscription
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
          endDate: {
            gt: new Date(),
          },
        },
      },
    },
  });

  if (host.subscriptions.length === 0) {
    throw new Error("Host must have an active subscription to create blogs");
  }

  const file = req.file;
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    req.body.coverImage = uploadResult?.secure_url;
  }

  const blogData = {
    ...req.body,
    hostId: host.id,
  };

  const result = await prisma.blog.create({
    data: blogData,
  });

  return result;
};

const getAllBlogs = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.BlogWhereInput[] = [];

  // Only show published blogs for non-admins (add auth check in controller)
  andConditions.push({
    status: "PUBLISHED",
  });

  if (searchTerm) {
    andConditions.push({
      OR: blogSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.BlogWhereInput = andConditions.length > 0
    ? { AND: andConditions }
    : {};

  const result = await prisma.blog.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      tour: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const total = await prisma.blog.count({
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

const getBlogById = async (id: string) => {
  const result = await prisma.blog.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          bio: true,
        },
      },
      tour: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      comments: {
        where: {
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              admin: {
                select: { name: true, profilePhoto: true },
              },
              host: {
                select: { name: true, profilePhoto: true },
              },
              tourist: {
                select: { name: true, profilePhoto: true },
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  admin: {
                    select: { name: true, profilePhoto: true },
                  },
                  host: {
                    select: { name: true, profilePhoto: true },
                  },
                  tourist: {
                    select: { name: true, profilePhoto: true },
                  },
                },
              },
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  // Increment view count
  await prisma.blog.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return result;
};

const updateBlog = async (user: IJWTPayload, id: string, req: Request) => {
  // Check if blog belongs to the host
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const blog = await prisma.blog.findUniqueOrThrow({
    where: {
      id,
      hostId: host.id, // Ensure host owns the blog
    },
  });

  const file = req.file;
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    req.body.coverImage = uploadResult?.secure_url;
  }

  const result = await prisma.blog.update({
    where: { id },
    data: req.body,
  });

  return result;
};

const deleteBlog = async (user: IJWTPayload, id: string) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const blog = await prisma.blog.findUniqueOrThrow({
    where: {
      id,
      hostId: host.id,
    },
  });

  const result = await prisma.blog.delete({
    where: { id },
  });

  return result;
};

const createComment = async (user: IJWTPayload, blogId: string, data: any) => {
  await prisma.blog.findUniqueOrThrow({
    where: {
      id: blogId,
    },
  });

  const commentData = {
    ...data,
    blogId,
    authorId: user.id,
  };

  const result = await prisma.blogComment.create({
    data: commentData,
  });

  return result;
};

const updateComment = async (user: IJWTPayload, commentId: string, data: any) => {
  const comment = await prisma.blogComment.findUniqueOrThrow({
    where: {
      id: commentId,
      authorId: user.id, // Ensure user owns the comment
    },
  });

  const result = await prisma.blogComment.update({
    where: { id: commentId },
    data: {
      ...data,
      isEdited: true,
    },
  });

  return result;
};

const deleteComment = async (user: IJWTPayload, commentId: string) => {
  const comment = await prisma.blogComment.findUniqueOrThrow({
    where: {
      id: commentId,
      authorId: user.id, // Ensure user owns the comment
    },
  });

  // Delete all replies first
  await prisma.blogComment.deleteMany({
    where: {
      parentId: commentId,
    },
  });

  const result = await prisma.blogComment.delete({
    where: { id: commentId },
  });

  return result;
};

const toggleLike = async (user: IJWTPayload, blogId: string) => {
  await prisma.blog.findUniqueOrThrow({
    where: {
      id: blogId,
    },
  });

  const existingLike = await prisma.blogLike.findUnique({
    where: {
      userId_blogId: {
        userId: user.id,
        blogId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.blogLike.delete({
      where: {
        id: existingLike.id,
      },
    });

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });

    return { liked: false };
  } else {
    // Like
    await prisma.blogLike.create({
      data: {
        userId: user.id,
        blogId,
      },
    });

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return { liked: true };
  }
};

const toggleCommentLike = async (user: IJWTPayload, commentId: string) => {
  await prisma.blogComment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  const existingLike = await prisma.blogCommentLike.findUnique({
    where: {
      userId_commentId: {
        userId: user.id,
        commentId,
      },
    },
  });

  if (existingLike) {
    // Unlike comment
    await prisma.blogCommentLike.delete({
      where: {
        id: existingLike.id,
      },
    });

    return { liked: false };
  } else {
    // Like comment
    await prisma.blogCommentLike.create({
      data: {
        userId: user.id,
        commentId,
      },
    });

    return { liked: true };
  }
};

const getMyBlogs = async (user: IJWTPayload) => {
  const host = await prisma.host.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const blogs = await prisma.blog.findMany({
    where: {
      hostId: host.id,
    },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return blogs;
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  toggleCommentLike,
  getMyBlogs,
};