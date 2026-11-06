import { object, string } from "yup";

// minimum length for new passwords (sign-up, reset and change). older
// accounts may have shorter passwords, so logging in doesn't enforce it.
export const MIN_PASSWORD_LENGTH = 15;

export const PASSWORD_LENGTH_MESSAGE = `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`;

export const LoginSchema = object({
  username: string().required("Enter your username"),
  password: string().required("Enter your password"),
});

export const SignupSchema = object({
  username: string().required("Enter your username"),
  password: string()
    .min(MIN_PASSWORD_LENGTH, PASSWORD_LENGTH_MESSAGE)
    .required("Enter your password"),
});
