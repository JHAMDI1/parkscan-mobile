import { z } from 'zod';

export const vehicleSchema = z.object({
  plate: z.string()
    .min(1, { message: "الرجاء إدخال رقم اللوحة" })
    .max(50, { message: "رقم اللوحة طويل جداً" }),
  make: z.string().optional(),
  floor: z.string().optional()
});
