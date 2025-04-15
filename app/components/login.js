"use client"

// react imports
import React, { useActionState, useEffect } from 'react';

// actions imports
import { login } from "@/app/actions/login"

// chakra ui imports
import {
  Box,
  Button,
  ClientOnly,
  Field,
  Input,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input";

// components imports
import { ToastSignUp } from "./toastalert";
import { useColorModeValue } from "@/app/components/ui/color-mode";

const initialState = {
  error: '',
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  useEffect(() => { }, [state]);

  // color mode
  const color = useColorModeValue("maroon", "yellow");


  return (
    <ClientOnly>
      <form
        action={formAction}
      >
        <Box marginLeft="auto" marginRight="auto" maxW={400}>
          <ToastSignUp />
          <Field.Root required>
            <Field.Label>
              Username
            </Field.Label>
            <Input name="username" placeholder="username.here" size="lg" />
          </Field.Root>
          <Field.Root marginTop={4} required>
            <Field.Label>
              Password
            </Field.Label>
            <PasswordInput name="password" placeholder="AVeryGoodPassword" size="lg" />
          </Field.Root>
          <Button
            disabled={pending}
            id="submit"
            marginTop={8}
            type="submit"
            width={120}
          >
            Sign in
          </Button>
          {pending ? (<Spinner />) : null}
          <Text marginTop={8}>
            Don't have an account? Create one with an invite code{' '}
            <Link
              color={color}
              href='/'
              variant="underline"
            >
              here
            </Link>.
          </Text>
        </Box>
      </form>
    </ClientOnly>
  )
}