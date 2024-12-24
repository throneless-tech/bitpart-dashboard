import { object, string } from 'yup';

export const loginSchema = object({
  email: string().email().required(),
  code: string().required()
});

export const broadcastSchema = object({
  name: string().required(),
  welcomeMessage: string().required(),
});


// If any form fields are invalid, return early
if (!validatedFields.success) {
  return {
    errors: validatedFields.error.flatten().fieldErrors,
  }
}

// TODO call on Bitpart to find the code and login user