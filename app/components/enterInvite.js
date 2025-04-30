"use client";

// react imports
import React, { useActionState, useEffect } from "react";

// actions imports
import { validateCode } from "../actions/validateCode";

// chakra ui imports
import { Box, Button, Field } from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input";

const initialState = {
  error: "",
};

export function InviteForm() {
  const [state, formAction, pending] = useActionState(
    validateCode,
    initialState,
  );

  useEffect(() => {}, [state]);

  return (
    <form action={formAction}>
      <Box marginLeft="auto" marginRight="auto" maxW={400}>
        <Field.Root invalid={state?.error} marginTop={4} required>
          <Field.Label>Code</Field.Label>
          <PasswordInput name="code" placeholder="invite-code-here" size="lg" />
          {state?.error ? (
            <Field.ErrorText>{state.error}</Field.ErrorText>
          ) : null}
        </Field.Root>
      </Box>
      <Button disabled={pending} marginTop={4} type="submit">
        Get started
      </Button>
    </form>
  );
}
