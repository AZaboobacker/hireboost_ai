import { z } from "zod";

export const optimizeSchema = z.object({
  resumeText: z.string().min(1, "Resume is required.").max(12000, "Resume is too long."),
  jobText: z.string().min(1, "Job description is required.").max(12000, "Job description is too long.")
});

export const checkoutSchema = z.object({
  tier: z.enum(["single", "30day", "lifetime"]),
  email: z.string().email("Enter a valid email address.")
});
