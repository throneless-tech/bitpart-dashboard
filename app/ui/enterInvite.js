import { redirect } from "next/navigation"
import { AuthError } from "next-auth"

// auth imports
import { signIn } from "@/auth"

// chakra ui imports
import { Box, Button, Field } from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input"

export function InviteForm() {
  return (
    <form
      action={async (formData) => {
        "use server"
        try {
          await signIn(
            "credentials",
            {
              code: formData.get("code"),
              redirectTo: '/signup'
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
        <Field.Root marginTop={4} required>
          <Field.Label>
            Code
          </Field.Label>
          <PasswordInput name="code" placeholder="invite-code-here" size="lg" />
        </Field.Root>
      </Box>
      <Button marginTop={4} type="submit">
        Get started
      </Button>
    </form>
  )
}