import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

// auth imports
import { register } from "@/app/actions/register"

// chakra ui imports
import { Container, Button, Field, Input } from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input"

export function SignupForm() {
  return (
    <form
      action={async (formData) => {
        "use server"
        try {
          await register({
              username: formData.get("username"),
              password: formData.get("password"),
            });
          return redirect(`/dashboard`);
        } catch (error) {
          if (error instanceof AuthError) {
            return redirect(`/error?error=${error.type}`);
          }
          throw error;
        }
      }}
    >
      <Container marginLeft="auto" marginRight="auto" maxW="lg">
        <Field.Root required>
          <Field.Label>
            Choose a username
          </Field.Label>
          <Input name="username" placeholder="username.here" size="lg" />
        </Field.Root>
        <Field.Root marginTop={4} required>
          <Field.Label>
            Choose a password
          </Field.Label>
          <PasswordInput name="password" placeholder="AVeryGoodPassword" size="lg" />
        </Field.Root>
        {/* <Field.Root marginTop={4} required>
          <Field.Label>
            Confirm password
          </Field.Label>
          <PasswordInput name="passwordConfirm" placeholder="AVeryGoodPassword" size="lg" />
        </Field.Root> */}
        <Button
          marginTop={8}
          type="submit"
          width={120}
        >
          Sign up
        </Button>
      </Container>
    </form>
  )
}