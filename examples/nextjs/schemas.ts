import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export const SearchUsersSchema = z.object({
  queryString: z.string().optional(),
  numberOfResults: z.number().min(1).max(500).optional(),
  startRow: z.number().min(0).optional(),
  sortFields: z.array(z.object({
    name: z.string(),
    order: z.enum(['asc', 'desc']).optional(),
  })).optional(),
});

export const UpdateUserSchema = z.object({
  userId: z.string().uuid(),
  user: z.object({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    data: z.record(z.any()).optional(),
  }),
});

export const DeleteUserSchema = z.object({
  userId: z.string().uuid(),
  hardDelete: z.boolean().optional(),
});

export const CreateApplicationSchema = z.object({
  name: z.string().min(1),
  roles: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export const GetUserSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine(data => data.userId || data.email, {
  message: "Either userId or email must be provided"
});