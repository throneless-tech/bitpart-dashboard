"use client";

import { useActionState } from "react";

// chakra ui imports
import { Link, Text } from "@chakra-ui/react";

// actions
import { verifyEmail } from "@/app/_actions/account";

// components
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// confirming takes a button press rather than happening on page load, so
// email link scanners that open links automatically can't use up the token
export function VerifyEmailForm({ loggedIn, token }) {
  const [state, formAction, pending] = useActionState(
    async () => verifyEmail(token),
    null,
  );
  const color = useColorModeValue("purple.600", "purple.400");

  const next = loggedIn ? (
    <Link color={color} href="/settings" variant="underline">
      Go to your settings
    </Link>
  ) : (
    <Link color={color} href="/login" variant="underline">
      Login
    </Link>
  );

  if (state?.email) {
    return (
      <>
        <Text>Thanks, {state.email} is now confirmed for your account.</Text>
        <Text marginTop={4}>{next}</Text>
      </>
    );
  }

  if (!token || state?.error) {
    return (
      <>
        <Text>
          {state?.error ?? "This confirmation link is incomplete."} You can
          request a new link from your settings page.
        </Text>
        <Text marginTop={4}>{next}</Text>
      </>
    );
  }

  return (
    <form action={formAction}>
      <Text>Press the button below to confirm your email address.</Text>
      <Button
        color="white"
        colorPalette="purple"
        disabled={pending}
        marginTop={8}
        type="submit"
      >
        Confirm email address
      </Button>
    </form>
  );
}
