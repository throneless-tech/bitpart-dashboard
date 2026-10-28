"use client";

import { useActionState } from "react";

// chakra ui imports
import { Field, Input, Link, Text } from "@chakra-ui/react";

// actions
import { requestPasswordReset } from "@/app/_actions/account";

// components
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { geistMono } from "@/app/fonts";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});
  const color = useColorModeValue("purple.600", "purple.400");

  if (state?.success) {
    return (
      <>
        <Text>{state.success}</Text>
        <Text marginTop={4}>
          <Link color={color} href="/login" variant="underline">
            Back to login
          </Link>
        </Text>
      </>
    );
  }

  return (
    <form action={formAction}>
      <Text marginBottom={8}>
        Enter the username or email address for your account. If the account has
        an email address, we'll send it a link to reset your password. Accounts
        without an email address can't reset their password.
      </Text>
      <Field.Root invalid={!!state?.error?.identifier} required>
        <Field.Label className={geistMono.className}>
          Username or email
        </Field.Label>
        <Input name="identifier" size="lg" />
        {state?.error?.identifier ? (
          <Field.ErrorText>{state.error.identifier}</Field.ErrorText>
        ) : null}
      </Field.Root>
      <Button
        color="white"
        colorPalette="purple"
        disabled={pending}
        marginTop={8}
        type="submit"
      >
        Send reset link
      </Button>
    </form>
  );
}
