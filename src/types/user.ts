import { type InitialImageType } from "@/components/core/UploadThingUploadSingleImage";
import { z } from "zod";
import { getUserNameSchema } from "@/schemas/shared-schemas";

export const UpdateProfileInput = z.object({
  name: getUserNameSchema(),
  // Keep other fields optional as in the original form component
  username: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),

  // New fields for related UTImage ID
  avatarImageId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),

  // Fields for direct image URLs (if still supported)
  avatarImage: z.custom<InitialImageType | null | undefined>().optional(),
  coverImage: z.custom<InitialImageType | null | undefined>().optional(),
});

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>;
