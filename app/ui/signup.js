"use client"

// react imports
import { useActionState, useEffect } from 'react';

// actions imports
import { register } from "@/app/actions/register"

// chakra ui imports
import { Container, Button, Field, Input } from "@chakra-ui/react";
import { PasswordInput } from "@/app/components/ui/password-input"

const initialState = {
  error: '',
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  useEffect(() => { }, [state]);

  return (
    <form
      action={formAction}
    >
      <Container marginLeft="auto" marginRight="auto" maxW="lg">
        <Field.Root invalid={state?.error?.username} required>
          <Field.Label>
            Choose a username
          </Field.Label>
          <Input name="username" placeholder="username.here" size="lg" />
          {state?.error?.username ? (
            <Field.ErrorText>{state.error.username}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Field.Root marginTop={4} required>
          <Field.Label>
            Choose a password
          </Field.Label>
          <PasswordInput name="password" placeholder="AVeryGoodPassword" size="lg" />
        </Field.Root>
        <Field.Root invalid={state?.error?.password} marginTop={4} required>
          <Field.Label>
            Confirm password
          </Field.Label>
          <PasswordInput name="passwordConfirm" placeholder="AVeryGoodPassword" size="lg" />
          {state?.error?.password ? (
            <Field.ErrorText>{state.error.password}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Button
          disabled={pending}
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