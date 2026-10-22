
import { z } from "zod";

const RegistrationZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
});

const LoginZodSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Invalid password"),
});

export const AuthValidation = {
  RegistrationZodSchema,
  LoginZodSchema,
};
