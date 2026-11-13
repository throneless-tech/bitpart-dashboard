"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

// chakra ui imports
import {
  Badge,
  Box,
  Field,
  Heading,
  Input,
  Separator,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { PasswordInput } from "@/app/_components/ui/password-input";

// actions
import {
  cancelEmailChange,
  changeEmail,
  changePassword,
  removeEmail,
  resendVerificationEmail,
  setBotIssueNotifications,
} from "@/app/_actions/account";

// components
import { Button } from "@/app/_components/ui/button";
import SecuritySettings from "@/app/_components/securitySettings";

// fonts
import { geistMono } from "@/app/fonts";

import { MIN_PASSWORD_LENGTH } from "@/app/_lib/definitions";

const Section = ({ children, title }) => (
  <Box marginTop={10}>
    <Heading as="h2" className={geistMono.className} size="md">
      {title}
    </Heading>
    <Separator marginBottom={6} marginTop={2} />
    {children}
  </Box>
);

const Message = ({ state }) =>
  state?.success ? (
    <Text color="green.600" marginTop={4}>
      {state.success}
    </Text>
  ) : state?.error?.general ? (
    <Text color="red.500" marginTop={4}>
      {state.error.general}
    </Text>
  ) : null;

const CurrentPassword = ({ state }) => (
  <Field.Root invalid={!!state?.error?.currentPassword} marginTop={4} required>
    <Field.Label className={geistMono.className}>Current password</Field.Label>
    <PasswordInput name="currentPassword" size="lg" />
    {state?.error?.currentPassword ? (
      <Field.ErrorText>{state.error.currentPassword}</Field.ErrorText>
    ) : null}
  </Field.Root>
);

export default function Settings({ account }) {
  const router = useRouter();
  const [notice, setNotice] = useState(null);
  const [notify, setNotify] = useState(account.notifyBotIssues);
  const [notifyNotice, setNotifyNotice] = useState(null);

  // reload the account details after a change
  const withRefresh = (action) => async (prevState, formData) => {
    const result = await action(prevState, formData);
    if (result?.success) router.refresh();
    return result;
  };

  const [emailState, emailAction, emailPending] = useActionState(
    withRefresh(changeEmail),
    {},
  );
  const [removeState, removeAction, removePending] = useActionState(
    withRefresh(removeEmail),
    {},
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    {},
  );

  const handleResend = async () => {
    const result = await resendVerificationEmail(account.username);
    setNotice(result);
  };

  const handleCancel = async () => {
    const result = await cancelEmailChange(account.username);
    setNotice(result);
    router.refresh();
  };

  const handleNotifyChange = async (enabled) => {
    setNotify(enabled);
    const result = await setBotIssueNotifications(account.username, enabled);
    if (result?.error) setNotify(!enabled);
    setNotifyNotice(
      result?.error ? { error: { general: result.error } } : result,
    );
  };

  const noticeState = notice?.error
    ? { error: { general: notice.error } }
    : notice;

  return (
    <>
      <Section title="Account">
        <Text className={geistMono.className} fontSize="sm" fontWeight="bold">
          Username
        </Text>
        <Text fontSize="sm">{account.username}</Text>
      </Section>

      <Section title="Email">
        {account.email ? (
          <Stack alignItems="center" direction="row">
            <Text fontSize="sm">{account.email}</Text>
            <Badge colorPalette={account.emailVerified ? "green" : "yellow"}>
              {account.emailVerified ? "Confirmed" : "Not confirmed"}
            </Badge>
          </Stack>
        ) : (
          <Text fontSize="sm">
            Your account has no email address. Without one, you won't be able to
            reset your password if you forget it.
          </Text>
        )}
        {account.pendingEmail ? (
          <Text fontSize="sm" marginTop={4}>
            Waiting for you to confirm {account.pendingEmail}. Until then, your
            current email address stays in use.
          </Text>
        ) : null}
        {account.pendingEmail || (account.email && !account.emailVerified) ? (
          <Stack direction="row" marginTop={4}>
            <Button
              color="fg"
              onClick={handleResend}
              size="sm"
              variant="outline"
            >
              Resend confirmation email
            </Button>
            {account.pendingEmail ? (
              <Button
                color="fg"
                onClick={handleCancel}
                size="sm"
                variant="outline"
              >
                Cancel email change
              </Button>
            ) : null}
          </Stack>
        ) : null}
        <Message state={noticeState} />

        <form action={emailAction}>
          <input name="username" type="hidden" value={account.username} />
          <Field.Root
            invalid={!!emailState?.error?.email}
            marginTop={8}
            required
          >
            <Field.Label className={geistMono.className}>
              {account.email ? "New email address" : "Add an email address"}
            </Field.Label>
            <Input name="email" placeholder="email@mail.org" size="lg" />
            <Field.HelperText>
              We'll send a confirmation link to the new address.
              {account.email
                ? " Your current address stays in use until you confirm the new one."
                : ""}
            </Field.HelperText>
            {emailState?.error?.email ? (
              <Field.ErrorText>{emailState.error.email}</Field.ErrorText>
            ) : null}
          </Field.Root>
          <CurrentPassword state={emailState} />
          <Button
            color="white"
            colorPalette="purple"
            disabled={emailPending}
            marginTop={6}
            type="submit"
          >
            {account.email ? "Change email" : "Add email"}
          </Button>
          <Message state={emailState} />
        </form>

        {account.email ? (
          <form action={removeAction}>
            <input name="username" type="hidden" value={account.username} />
            <Text fontSize="sm" marginTop={10}>
              Remove your email address. You won't be able to reset your
              password if you forget it.
            </Text>
            <CurrentPassword state={removeState} />
            <Button
              color="fg"
              disabled={removePending}
              marginTop={6}
              type="submit"
              variant="outline"
            >
              Remove email
            </Button>
            <Message state={removeState} />
          </form>
        ) : null}
      </Section>

      <Section title="Notifications">
        <Switch.Root
          checked={!!account.email && notify}
          disabled={!account.email}
          onCheckedChange={(e) => handleNotifyChange(e.checked)}
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Label>
            Email me when one of my bots has a problem
          </Switch.Label>
        </Switch.Root>
        <Text color="fg.muted" fontSize="sm" marginTop={2}>
          {account.email
            ? "For example, if a bot is unlinked from Signal, needs a captcha solved, or can't send messages. You'll get at most one email per problem every few hours."
            : "Add an email address above to get notified when one of your bots has a problem."}
        </Text>
        <Message state={notifyNotice} />
      </Section>

      <Section title="Security">
        <SecuritySettings account={account} />
      </Section>

      <Section title="Password">
        <form action={passwordAction}>
          <input name="username" type="hidden" value={account.username} />
          <CurrentPassword state={passwordState} />
          <Field.Root
            invalid={!!passwordState?.error?.password}
            marginTop={4}
            required
          >
            <Field.Label className={geistMono.className}>
              New password
            </Field.Label>
            <PasswordInput name="password" size="lg" />
            <Field.HelperText>
              At least {MIN_PASSWORD_LENGTH} characters.
            </Field.HelperText>
            {passwordState?.error?.password ? (
              <Field.ErrorText>{passwordState.error.password}</Field.ErrorText>
            ) : null}
          </Field.Root>
          <Field.Root marginTop={4} required>
            <Field.Label className={geistMono.className}>
              Confirm new password
            </Field.Label>
            <PasswordInput name="passwordConfirm" size="lg" />
          </Field.Root>
          <Text fontSize="sm" fontStyle="italic" marginTop={4}>
            Changing your password logs you out on every device, including this
            one.
          </Text>
          <Button
            color="white"
            colorPalette="purple"
            disabled={passwordPending}
            marginTop={6}
            type="submit"
          >
            Change password
          </Button>
          <Message state={passwordState} />
        </form>
      </Section>
    </>
  );
}
