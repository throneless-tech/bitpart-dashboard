import { object, string } from 'yup';

export const LoginSchema = object({
  username: string().required("Enter your username"),
  password: string().required("Enter your invite code")
});

// TODO call on Bitpart to find the code and login user