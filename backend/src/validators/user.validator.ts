import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

export const linkChildSchema = z.object({
  childId: z.string().uuid('Invalid child ID'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LinkChildInput = z.infer<typeof linkChildSchema>;
