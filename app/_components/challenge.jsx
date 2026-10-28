"use client";

import { useActionState } from "react";

// chakra ui imports
import { Field, Input, Link, List, Text } from "@chakra-ui/react";

// actions
import { submitBotChallenge } from "@/app/_actions/linkBot";

// components
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { geistMono } from "@/app/fonts";

const CAPTCHA_URL = "https://signalcaptchas.org/challenge/generate.html";

export function ChallengeForm({ botId, challenge, username }) {
  const [state, formAction, pending] = useActionState(submitBotChallenge, {});
  const color = useColorModeValue("purple.600", "purple.400");

  const back = (
    <Text marginTop={6}>
      <Link color={color} href="/my-bots" variant="underline">
        Back to My Bots
      </Link>
    </Text>
  );

  if (!challenge) {
    return (
      <>
        <Text>We couldn't find that bot.</Text>
        {back}
      </>
    );
  }

  if (state?.success) {
    return (
      <>
        <Text>{state.success}</Text>
        {back}
      </>
    );
  }

  return (
    <>
      <Text marginBottom={4}>
        {challenge.required
          ? `Signal is asking your bot "${challenge.botName}" to solve a captcha before it can send more messages.`
          : challenge.reachable
            ? `Your bot "${challenge.botName}" doesn't currently need a captcha. You only need this page if you've been asked to solve one.`
            : `We couldn't check your bot "${challenge.botName}" right now. If you were asked to solve a captcha, you can still do it here.`}
      </Text>
      <Text fontWeight="bold">To solve it:</Text>
      <List.Root as="ol" marginLeft={6} marginTop={2}>
        <List.Item>
          Open{" "}
          <Link
            color={color}
            href={CAPTCHA_URL}
            rel="noopener noreferrer"
            target="_blank"
            variant="underline"
          >
            signalcaptchas.org
          </Link>{" "}
          on a computer and complete the captcha.
        </List.Item>
        <List.Item>
          When it's done, the page shows an "Open Signal" link. Don't click it.
          Instead, right-click it and choose "Copy link" (or "Copy link
          address").
        </List.Item>
        <List.Item>
          Paste the link below. It starts with <code>signalcaptcha://</code>
        </List.Item>
      </List.Root>
      <Text color="fg.muted" fontSize="sm" marginTop={2}>
        Captchas expire quickly, so paste the link straight away. If Signal
        rejects it, solve a new one.
      </Text>
      <form action={formAction}>
        <input name="botId" type="hidden" value={botId} />
        <input name="username" type="hidden" value={username} />
        <Field.Root invalid={!!state?.error} marginTop={8} required>
          <Field.Label className={geistMono.className}>
            Captcha link
          </Field.Label>
          <Input
            autoComplete="off"
            name="captcha"
            placeholder="signalcaptcha://..."
            size="lg"
          />
          {state?.error ? (
            <Field.ErrorText>{state.error}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Button
          color="white"
          colorPalette="purple"
          disabled={pending}
          marginTop={6}
          type="submit"
        >
          Submit captcha
        </Button>
      </form>
      {back}
    </>
  );
}
