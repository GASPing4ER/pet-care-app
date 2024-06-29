import { z } from "zod";
import { DEFAULT_PET_IMAGE } from "./constants";

export const petIdSchema = z.string().cuid();

export const petFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Name is required" })
      .max(100, { message: "Name is too long" }),
    ownerName: z
      .string()
      .trim()
      .min(1, { message: "Owner name is required" })
      .max(100, { message: "Owner name is too long" }),
    imageUrl: z.union([
      z.string().trim().url({ message: "Invalid image URL" }),
      z.literal(""),
    ]),
    age: z.coerce
      .number()
      .int()
      .positive({ message: "Age must be a positive number" })
      .max(999),
    notes: z.union([
      z.string().trim().max(1000, { message: "Notes are too long" }),
      z.literal(""),
    ]),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMAGE,
  }));

export type TPetForm = z.infer<typeof petFormSchema>;

export const authScema = z.object({
  email: z.string().email().max(100),
  password: z.string().max(100),
});

export type TAuth = z.infer<typeof authScema>;
