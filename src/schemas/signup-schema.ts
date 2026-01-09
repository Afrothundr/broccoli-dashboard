import { object, type z } from "zod";
import {
  getEmailSchema,
  getUserNameSchema,
  getPasswordSchema,
} from "./shared-schemas";

export const signUpSchema = object({
  name: getUserNameSchema(),
  email: getEmailSchema(),
  password: getPasswordSchema("password"),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
