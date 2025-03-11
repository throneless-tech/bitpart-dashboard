import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

// auth imports
import { signIn } from "@/auth"

// chakra ui imports
import { Alert, Box, Button, Field, Input } from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input"

export function LoginForm() {
  return (
    <form
      action={async (formData) => {
        "use server"
        try {
          await signIn(
            "credentials",
            {
              username: formData.get("username"),
              password: formData.get("password"),
              redirectTo: '/dashboard'
            }
          );
        } catch (error) {
          if (error instanceof AuthError) {
            return redirect(`/error?error=${error.type}`);
          }
          throw error;
        }
      }}
    >
      <Box marginLeft="auto" marginRight="auto" maxW={400}>
        <Field.Root required>
          <Field.Label>
            Username
          </Field.Label>
          <Input name="username" placeholder="username.here" size="lg" />
        </Field.Root>
        <Field.Root marginTop={4} required>
          <Field.Label>
            Password
          </Field.Label>
          <PasswordInput name="password" placeholder="AVeryGoodPassword" size="lg" />
        </Field.Root>
        <Button
          marginTop={8}
          type="submit"
          width={120}
        >
          Sign in
        </Button>
      </Box>
    </form>
  )
}