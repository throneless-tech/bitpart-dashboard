"use client";

// react imports
import React, { useActionState, useEffect } from "react";

// actions imports
import { register } from "@/app/_actions/register";

// chakra ui imports
import { Button, Container, Field, Input } from "@chakra-ui/react";
import { PasswordInput } from "@/app/_components/ui/password-input";

const initialState = {
  error: "",
};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <form action={formAction}>
      <Container marginLeft="auto" marginRight="auto" maxW="lg">
        <Field.Root invalid={state?.error} required>
          <Field.Label>Enter your invite code</Field.Label>
          <PasswordInput name="code" placeholder="invite-code-here" size="lg" />
          {state?.error ? (
            <Field.ErrorText>
              {state?.error?.general || state?.error?.code}
            </Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root invalid={state?.error?.username} marginTop={12}>
          <Field.Label>Enter your email address</Field.Label>
          <Input name="email" placeholder="email@mail.org" size="lg" />
          <Field.HelperText>
            This field is optional. You may include an email for password
            recovery. Password recovery will not be possible without an email
            address.
          </Field.HelperText>
          {state?.error?.email ? (
            <Field.ErrorText>{state.error.email}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root invalid={state?.error?.username} marginTop={12} required>
          <Field.Label>Choose a username</Field.Label>
          <Input name="username" placeholder="username.here" size="lg" />
          {state?.error?.username ? (
            <Field.ErrorText>{state.error.username}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root invalid={state?.error?.password} marginTop={4} required>
          <Field.Label>Choose a password</Field.Label>
          <PasswordInput
            name="password"
            placeholder="AVeryGoodPassword"
            size="lg"
          />
          {state?.error?.password ? (
            <Field.ErrorText>{state.error.password}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root
          invalid={state?.error?.passwordConfirm}
          marginTop={4}
          required
        >
          <Field.Label>Confirm password</Field.Label>
          <PasswordInput
            name="passwordConfirm"
            placeholder="AVeryGoodPassword"
            size="lg"
          />
          {state?.error?.passwordConfirm ? (
            <Field.ErrorText>{state.error.passwordConfirm}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Button disabled={pending} marginTop={8} type="submit" width={120}>
          Sign up
        </Button>
      </Container>
    </form>
  );
}
