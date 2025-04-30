import { object, string } from "yup";

export const LoginSchema = object({
  username: string().required("Enter your username"),
  password: string()
    .min(8, "Password must contain at least 8 characters")
    .required("Enter your password"),
});
