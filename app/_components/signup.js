"use client";

// react imports
import React, { useActionState } from "react";

// actions imports
import { register } from "@/app/_actions/register";

// chakra ui imports
import { Container, Field, Input, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/app/_components/ui/password-input";

// components
import { Button } from "@/app/_components/ui/button";

// fonts
import { geistMono } from "../fonts";

const initialState = {
  error: "",
};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction}>
      <Container marginLeft="auto" marginRight="auto" maxW="lg">
        {state?.error?.general ? (
          <Text color="red.500" marginBottom={8} role="alert">
            {state.error.general}
          </Text>
        ) : null}
        <Field.Root invalid={state?.error?.email}>
          <Field.Label className={geistMono.className}>
            Enter your email address
          </Field.Label>
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
          <Field.Label className={geistMono.className}>
            Choose a username
          </Field.Label>
          <Input name="username" placeholder="username.here" size="lg" />
          {state?.error?.username ? (
            <Field.ErrorText>{state.error.username}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root invalid={state?.error?.password} marginTop={4} required>
          <Field.Label className={geistMono.className}>
            Choose a password
          </Field.Label>
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
          <Field.Label className={geistMono.className}>
            Confirm password
          </Field.Label>
          <PasswordInput
            name="passwordConfirm"
            placeholder="AVeryGoodPassword"
            size="lg"
          />
          {state?.error?.passwordConfirm ? (
            <Field.ErrorText>{state.error.passwordConfirm}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Button
          color="white"
          colorPalette="purple"
          disabled={pending}
          marginTop={8}
          type="submit"
          width={120}
        >
          Sign up
        </Button>
      </Container>
    </form>
  );
}
