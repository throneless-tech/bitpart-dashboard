"use client";

import { useActionState } from "react";

// chakra ui imports
import { Field, Link, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/app/_components/ui/password-input";

// actions
import { resetPassword } from "@/app/_actions/account";

// components
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { geistMono } from "@/app/fonts";

import { MIN_PASSWORD_LENGTH } from "@/app/_lib/definitions";

export function ResetPasswordForm({ token }) {
  const [state, formAction, pending] = useActionState(resetPassword, {});
  const color = useColorModeValue("purple.600", "purple.400");

  if (!token) {
    return (
      <Text>
        This reset link is incomplete.{" "}
        <Link color={color} href="/forgot-password" variant="underline">
          Request a new one
        </Link>
        .
      </Text>
    );
  }

  return (
    <form action={formAction}>
      <input name="token" type="hidden" value={token} />
      {state?.error?.general ? (
        <Text color="red.500" marginBottom={6}>
          {state.error.general}{" "}
          <Link color={color} href="/forgot-password" variant="underline">
            Request a new link
          </Link>
          .
        </Text>
      ) : null}
      <Field.Root invalid={!!state?.error?.password} required>
        <Field.Label className={geistMono.className}>
          Choose a new password
        </Field.Label>
        <PasswordInput name="password" size="lg" />
        <Field.HelperText>
          At least {MIN_PASSWORD_LENGTH} characters.
        </Field.HelperText>
        {state?.error?.password ? (
          <Field.ErrorText>{state.error.password}</Field.ErrorText>
        ) : null}
      </Field.Root>
      <Field.Root marginTop={4} required>
        <Field.Label className={geistMono.className}>
          Confirm new password
        </Field.Label>
        <PasswordInput name="passwordConfirm" size="lg" />
      </Field.Root>
      <Text fontStyle="italic" marginTop={4}>
        Resetting your password logs you out on every device.
      </Text>
      <Button
        color="white"
        colorPalette="purple"
        disabled={pending}
        marginTop={8}
        type="submit"
      >
        Reset password
      </Button>
    </form>
  );
}
