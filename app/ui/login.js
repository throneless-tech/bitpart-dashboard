import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { Alert, Box, Button, Field, Input } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input"

import { signIn } from "@/auth"

export function LoginForm() {
  return (
    <form
      action={async (formData) => {
        "use server"
        try {
          await signIn("credentials", formData,  { redirectTo: '/dashboard' } );
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
            Code
          </Field.Label>
          <PasswordInput name="password" placeholder="invite-code-here" size="lg" />
        </Field.Root>
      </Box>
      <Button marginTop={4} type="submit">
        Sign in
      </Button>
    </form>
  )
}