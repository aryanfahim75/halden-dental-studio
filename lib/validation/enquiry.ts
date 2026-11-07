import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(80, "Use 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{8,20}$/, "Enter a phone number, including the country code if you're abroad."),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address, or leave it blank."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more, at least 10 characters.")
    .max(1000, "Keep your message under 1,000 characters."),
  consent: z.literal(true, { errorMap: () => ({ message: "Tick the box so we can use your details to reply." }) }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
