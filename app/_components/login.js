"use client";

// react imports
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// auth imports
import { authClient, refreshSession } from "@/app/_lib/authClient";
import { passwordSignIn } from "@/app/_lib/passwordSignIn";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Field,
  Input,
  Link,
  Spinner,
  Stack,
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

const INVALID = "Invalid credentials. Please try again.";

const METHOD_LABELS = {
  totp: "Authenticator app",
  otp: "Email code",
  backup: "Backup code",
};

const showError = (title) => toaster.create({ title, type: "error" });

// the second step for users with an authenticator app or email codes
function SecondFactor({ methods, onDone }) {
  const [method, setMethod] = useState(methods[0]);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendCode = async () => {
    setPending(true);
    const { error } = await authClient.twoFactor.sendOtp();
    setPending(false);
    if (error) {
      showError(error.message || "Couldn't send a code. Try again shortly.");
    } else {
      setSent(true);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setPending(true);
    const body = { code: code.trim() };
    const { error } =
      method === "totp"
        ? await authClient.twoFactor.verifyTotp(body)
        : method === "otp"
          ? await authClient.twoFactor.verifyOtp(body)
          : await authClient.twoFactor.verifyBackupCode(body);
    setPending(false);
    if (error) {
      showError(error.message || "That code didn't work.");
    } else {
      onDone();
    }
  };

  return (
    <form onSubmit={verify}>
      <Text fontSize="sm">
        Your account has two-factor authentication on. Enter a code to finish
        signing in.
      </Text>
      {methods.length > 1 ? (
        <Stack direction="row" marginTop={4} wrap="wrap">
          {methods.map((m) => (
            <Button
              color={m === method ? "white" : "fg"}
              colorPalette={m === method ? "purple" : undefined}
              key={m}
              onClick={() => {
                setMethod(m);
                setCode("");
              }}
              size="sm"
              variant={m === method ? "solid" : "outline"}
            >
              {METHOD_LABELS[m]}
            </Button>
          ))}
        </Stack>
      ) : null}
      {method === "otp" ? (
        <Box marginTop={4}>
          <Button
            color="fg"
            disabled={pending}
            onClick={sendCode}
            size="sm"
            variant="outline"
          >
            {sent ? "Send another code" : "Send code"}
          </Button>
          {sent ? (
            <Text fontSize="sm" marginTop={2}>
              We've emailed you a code.
            </Text>
          ) : null}
        </Box>
      ) : null}
      <Field.Root marginTop={4} required>
        <Field.Label className={geistMono.className}>
          {method === "backup"
            ? "Backup code"
            : method === "otp"
              ? "Code from the email"
              : "Code from your authenticator app"}
        </Field.Label>
        <Input
          autoComplete="one-time-code"
          name="code"
          onChange={(e) => setCode(e.target.value)}
          size="lg"
          value={code}
        />
      </Field.Root>
      <Button
        color="white"
        colorPalette="purple"
        disabled={pending || !code.trim()}
        marginTop={8}
        type="submit"
        width={120}
      >
        Verify
      </Button>
      {pending ? <Spinner /> : null}
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [methods, setMethods] = useState(null);

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");

  const loggedIn = () => {
    refreshSession();
    router.push("/my-bots");
  };

  // passkeys saved in the browser are offered in the username field
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential?.isConditionalMediationAvailable
    ) {
      window.PublicKeyCredential.isConditionalMediationAvailable().then(
        (available) => {
          if (!available) return;
          authClient.signIn
            .passkey({ autoFill: true })
            .then(({ error }) => {
              if (!error) loggedIn();
            })
            .catch(() => {});
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // submit form to attempt user login
  async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);

    try {
      const { data, error } = await passwordSignIn(
        authClient.signIn,
        formData.get("username")?.trim(),
        formData.get("password"),
      );

      if (error) {
        showError(error.status === 429 ? error.message : INVALID);
      } else if (data?.twoFactorRedirect) {
        setMethods(data.twoFactorMethods ?? []);
      } else {
        loggedIn();
      }
    } catch (error) {
      console.log(error);
      showError(INVALID);
    } finally {
      setPending(false);
    }
  }

  async function signInWithPasskey() {
    const { error } = await authClient.signIn.passkey();
    if (error) {
      showError(error.message || "Couldn't sign in with a passkey.");
    } else {
      loggedIn();
    }
  }

  return (
    <ClientOnly>
      <Box marginLeft="auto" marginRight="auto" maxW={400}>
        <ToastSignUp />
        {methods ? (
          methods.length ? (
            <SecondFactor methods={methods} onDone={loggedIn} />
          ) : (
            <Text fontSize="sm">
              Your account needs a second factor, but none can be used. Contact
              us at contact@bitp.art.
            </Text>
          )
        ) : (
          <form onSubmit={onSubmit}>
            <Field.Root required>
              <Field.Label className={geistMono.className}>
                Username or email
              </Field.Label>
              <Input
                autoComplete="username webauthn"
                name="username"
                size="lg"
              />
            </Field.Root>
            <Field.Root marginTop={4} required>
              <Field.Label className={geistMono.className}>
                Password
              </Field.Label>
              <PasswordInput
                autoComplete="current-password webauthn"
                name="password"
                size="lg"
              />
            </Field.Root>
            <Text marginTop={2}>
              <Link color={color} href="/forgot-password" variant="plain">
                Forgot your password?
              </Link>
            </Text>
            <Stack
              alignItems="center"
              direction="row"
              marginTop={8}
              wrap="wrap"
            >
              <Button
                color="white"
                colorPalette="purple"
                disabled={pending}
                id="submit"
                type="submit"
                width={120}
              >
                Sign in
              </Button>
              <Button
                color="fg"
                disabled={pending}
                onClick={signInWithPasskey}
                variant="outline"
              >
                Sign in with a passkey
              </Button>
              {pending ? <Spinner /> : null}
            </Stack>
          </form>
        )}
      </Box>
      <Box marginLeft="auto" marginRight="auto" maxW={500}>
        <Text fontStyle="italic" marginTop={8}>
          Don't have an account?{" "}
          <Link color={color} href="/signup" variant="plain">
            Create one here
          </Link>
          .
        </Text>
      </Box>
    </ClientOnly>
  );
}
