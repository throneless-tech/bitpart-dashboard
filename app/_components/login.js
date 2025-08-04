"use client";

// react imports
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

// actions imports
import { login } from "@/app/_actions/login";

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
import { PasswordInput } from "@/app/_components/ui/password-input";

// components imports
import { toaster } from "@/app/_components/ui/toaster";
import { ToastSignUp } from "./toastalert";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <>
      <Button
        disabled={pending}
        id="submit"
        marginTop={8}
        type="submit"
        width={120}
      >
        Sign in
      </Button>
      {pending ? <Spinner /> : null}
    </>
  );
}

export function LoginForm() {
  const router = useRouter();

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  // submit form to attempt user login
  async function onSubmit(formData) {
    try {
      const res = await login(formData);

      if (res.success) {
        router.push("/bots");
      } else {
        console.log(res.message);
        toaster.create({
          title: "Invalid credentials. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.log(error);
      toaster.create({
        title: "Invalid credentials. Please try again.",
        type: "error",
      });
    }
  }

  return (
    <ClientOnly>
      <form action={onSubmit}>
        <Box marginLeft="auto" marginRight="auto" maxW={400}>
          <ToastSignUp />
          <Field.Root required>
            <Field.Label>Username</Field.Label>
            <Input name="username" placeholder="username.here" size="lg" />
          </Field.Root>
          <Field.Root marginTop={4} required>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              name="password"
              placeholder="AVeryGoodPassword"
              size="lg"
            />
          </Field.Root>
          <Submit />
          <Text marginTop={8}>
            Don't have an account? Create one with an invite code{" "}
            <Link color={color} href="/" variant="underline">
              here
            </Link>
            .
          </Text>
        </Box>
      </form>
    </ClientOnly>
  );
}
