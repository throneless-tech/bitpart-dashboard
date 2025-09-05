"use client";

// react imports
import React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

// actions imports
import { login } from "@/app/_actions/login";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Field,
  Input,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { PasswordInput } from "@/app/_components/ui/password-input";

// components imports
import { Button } from "@/app/_components/ui/button";
import { toaster } from "@/app/_components/ui/toaster";
import { ToastSignUp } from "./toastalert";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { geistMono } from "../fonts";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <>
      <Button
        color="white"
        colorPalette="purple"
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
  const color = useColorModeValue("purple.600", "purple.400");

  // submit form to attempt user login
  async function onSubmit(formData) {
    try {
      const res = await login(formData);

      if (res.success) {
        router.push("/my-bots");
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
            <Field.Label className={geistMono.className}>
              Username or email
            </Field.Label>
            <Input name="username" size="lg" />
          </Field.Root>
          <Field.Root marginTop={4} required>
            <Field.Label className={geistMono.className}>Password</Field.Label>
            <PasswordInput name="password" size="lg" />
          </Field.Root>
          <Submit />
        </Box>
        <Box marginLeft="auto" marginRight="auto" maxW={500}>
          <Text fontStyle="italic" marginTop={8}>
            Don't have an account? Create one with an invite code{" "}
            <Link color={color} href="/" variant="plain">
              here
            </Link>
            .
          </Text>
        </Box>
      </form>
    </ClientOnly>
  );
}
