import { object, string } from 'yup';

export const LoginSchema = object({
  username: string().required(),
  password: string().required()
});

// If any form fields are invalid, return early
// if (!validatedFields.success) {
//   return {
//     errors: validatedFields.error.flatten().fieldErrors,
//   }
// } // FIXME this is erroring out

// TODO call on Bitpart to find the code and login user