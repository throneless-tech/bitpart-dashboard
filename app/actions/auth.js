import { LoginSchema } from '@/app/lib/definitions';
import { createSession, deleteSession } from '@/app/lib/session';
import prisma from '@/lib/prisma';

export async function login(state, formData) {
  // 1. Validate form fields
  const validatedFields = LoginSchema.safeParse({
    // email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 2. Prepare data for insertion into database
  const { password } = validatedFields.data
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Insert the user into the database or call an Library API
  // const data = await db
  //   .insert(users)
  //   .values({
  //     email,
  //     password: hashedPassword,
  //   })
  //   .returning({ id: users.id })

  // const user = data[0]

  const user = await prisma.user.findUnique({
    where: {
      password: password,
    },
  })

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  } else {
    console.log(user);
    
  }

  // TODO:
  // 4. Create user session
  await createSession(user.id);

  // 5. Redirect user
  redirect('/');
}

export async function logout() {
  deleteSession();
  redirect('/login');
}