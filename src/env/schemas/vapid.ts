import { z } from "zod";

export const clientSchema = z.object({});

export const serverSchema = z.object({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z
    .string()
    .nonempty(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY is required for push notifications",
    ),
  VAPID_PRIVATE_KEY: z
    .string()
    .nonempty("VAPID_PRIVATE_KEY is required for push notifications"),
  VAPID_SUBJECT: z
    .string()
    .email(
      "VAPID_SUBJECT must be a valid email (e.g., mailto:your-email@example.com)",
    )
    .or(z.string().url("VAPID_SUBJECT must be a valid URL")),
});
