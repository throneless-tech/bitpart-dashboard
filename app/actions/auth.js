export async function login(state, formData) {
  // 1. Validate form fields
  // ...

  // 2. Prepare data for insertion into database
  const { email, code } = validatedFields.data
  // e.g. Hash the user's password before storing it
  // const hashedPassword = await bcrypt.hash(code, 10)

  // 3. Insert the user into the database or call an Library API
  // const data = await db
  //   .insert(users)
  //   .values({
  //     email,
  //     password: hashedPassword,
  //   })
  //   .returning({ id: users.id })

  // const user = data[0]

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  // TODO:
  // 4. Create user session
  // 5. Redirect user
}