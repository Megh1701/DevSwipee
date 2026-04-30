import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long"),

  email: z
    .string()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  gender: z
    .string()
    .min(1, "Please select your gender"),

  age: z
    .number()
    .min(16, "You must be at least 16 years old"),

  city: z
    .string()
    .min( 1,"Please select your city"),
  
  location: z.object({
    type: z.literal("Point"),
    coordinates: z
      .array(z.number())
      .length(2, "Please select a valid city from suggestions"),
  }),

  interests: z
    .array(z.string())
    .min(1, "Please select at least one interest"),

  avatar: z
    .string()
    .min(1, "Please choose an avatar"),
});
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .toLowerCase()
    .email("Please enter a valid email address"),
   

  password: z
    .string()
    .min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  otp: z
    .string()
    .min(1, "OTP is required")
    .length(6, "OTP must be exactly 6 digits"),
});