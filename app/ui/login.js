import { redirect } from "next/navigation"
import { AuthError } from "next-auth"
import { Alert, Box, Button, Field } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input"

import { signIn } from "@/auth"

export function LoginForm() {

  return (
    <form
      action={async (formData) => {
        "use server"
        try {
          await signIn("credentials", formData, { redirectTo: "/dashboard" });
        } catch (error) {
          // if (error instanceof AuthError) {
          //   return redirect(`/?error=${error.type}`);
          // }
            console.log('here................', error.type);
          // throw error;
          return error.type
        } finally {
          return (
          <Alert.Root>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title >Invalid credentials</Alert.Title>
            </Alert.Content>
          </Alert.Root>
          )
        }
      }}
    >
      <Box marginLeft="auto" marginRight="auto" maxW={400}>
        <Field.Root invalid={false}>
          <Field.Label>
            Enter your code
          </Field.Label>
          <PasswordInput name="password" placeholder="your-invite-code-here" size="lg" />
          <Field.ErrorText >Invalid code</Field.ErrorText>
        </Field.Root>
      </Box>
      <Button marginTop={4} type="submit">
        Sign in
      </Button>
    </form>
  )
}