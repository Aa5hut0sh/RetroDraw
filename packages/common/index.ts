import {z} from 'zod';

export const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name cannot be empty"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const CreateRoomSchema = z.object({
    name : z.string().min(3).max(30),
    secret:z.string().min(3)
})