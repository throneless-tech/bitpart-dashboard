"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

// chakra ui imports
import { Badge, Box, Code, Field, Input, Stack, Text } from "@chakra-ui/react";

// actions
import {
  confirmTotpSetup,
  deletePasskey,
  disableEmailCodes,
  disableTotp,
  enableEmailCodes,
  regenerateBackupCodes,
  renamePasskey,
  startTotpSetup,
} from "@/app/_actions/security";
import { authClient } from "@/app/_lib/authClient";

// components
import { Button } from "@/app/_components/ui/button";

// fonts
import { geistMono } from "@/app/fonts";

const Message = ({ state }) =>
  state?.success ? (
    <Text color="green.600" fontSize="sm" marginTop={4}>
      {state.success}
    </Text>
  ) : state?.error?.general ? (
    <Text color="red.500" fontSize="sm" marginTop={4}>
      {state.error.general}
    </Text>
  ) : null;

const Label = ({ children }) => (
  <Text className={geistMono.className} fontSize="sm" fontWeight="bold">
    {children}
  </Text>
);

const OnOff = ({ on }) => (
  <Badge colorPalette={on ? "green" : "gray"}>{on ? "On" : "Off"}</Badge>
);

// a password field and a button, for the actions that need the password
const PasswordForm = ({
  action,
  children,
  label,
  pending,
  state,
  username,
}) => (
  <form action={action}>
    <input name="username" type="hidden" value={username} />
    {children}
    <Field.Root
      invalid={!!state?.error?.currentPassword}
      marginTop={4}
      required
    >
      <Field.Label className={geistMono.className}>
        Current password
      </Field.Label>
      <Input
        autoComplete="current-password"
        name="currentPassword"
        size="lg"
        type="password"
      />
      {state?.error?.currentPassword ? (
        <Field.ErrorText>{state.error.currentPassword}</Field.ErrorText>
      ) : null}
    </Field.Root>
    <Button
      color="fg"
      disabled={pending}
      marginTop={4}
      size="sm"
      type="submit"
      variant="outline"
    >
      {label}
    </Button>
    <Message state={state} />
  </form>
);

// shown once, straight after they're made
const BackupCodes = ({ codes }) =>
  codes?.length ? (
    <Box borderWidth="1px" borderRadius="md" marginTop={4} padding={4}>
      <Text fontSize="sm" fontWeight="bold">
        Your backup codes
      </Text>
      <Text fontSize="sm" marginTop={2}>
        Save these somewhere safe. Each one works once, if you can't use your
        other sign-in method. You won't be able to see them again.
      </Text>
      <Stack
        className={geistMono.className}
        direction="row"
        gap={4}
        marginTop={4}
        wrap="wrap"
      >
        {codes.map((code) => (
          <Code key={code}>{code}</Code>
        ))}
      </Stack>
    </Box>
  ) : null;

const withRefresh = (router, action) => async (prevState, formData) => {
  const result = await action(prevState, formData);
  if (result?.success) router.refresh();
  return result;
};

function Totp({ security, username }) {
  const router = useRouter();
  const [startState, startAction, startPending] = useActionState(
    startTotpSetup,
    {},
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    withRefresh(router, confirmTotpSetup),
    {},
  );
  const [offState, offAction, offPending] = useActionState(
    withRefresh(router, disableTotp),
    {},
  );

  if (confirmState?.success) {
    return (
      <>
        <Message state={confirmState} />
        <BackupCodes codes={startState?.backupCodes} />
      </>
    );
  }

  if (security.totp) {
    return (
      <PasswordForm
        action={offAction}
        label="Turn off authenticator app"
        pending={offPending}
        state={offState}
        username={username}
      />
    );
  }

  if (startState?.totp) {
    return (
      <form action={confirmAction}>
        <input name="username" type="hidden" value={username} />
        <Text fontSize="sm" marginTop={4}>
          Scan this QR code with your authenticator app, or enter the key by
          hand. Then enter the 6-digit code it shows.
        </Text>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="QR code for your authenticator app"
          src={startState.totp.qr}
          style={{ marginTop: 16, width: 200 }}
        />
        <Code className={geistMono.className} marginTop={2}>
          {startState.totp.secret}
        </Code>
        <Field.Root
          invalid={!!confirmState?.error?.code}
          marginTop={4}
          required
        >
          <Field.Label className={geistMono.className}>Code</Field.Label>
          <Input
            autoComplete="one-time-code"
            inputMode="numeric"
            name="code"
            size="lg"
          />
          {confirmState?.error?.code ? (
            <Field.ErrorText>{confirmState.error.code}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <Button
          color="white"
          colorPalette="purple"
          disabled={confirmPending}
          marginTop={4}
          size="sm"
          type="submit"
        >
          Turn on
        </Button>
        <Message state={confirmState} />
      </form>
    );
  }

  return (
    <PasswordForm
      action={startAction}
      label="Set up authenticator app"
      pending={startPending}
      state={startState}
      username={username}
    />
  );
}

function EmailCodes({ security, username }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    withRefresh(router, (prevState, formData) =>
      (formData.get("mode") === "off" ? disableEmailCodes : enableEmailCodes)(
        prevState,
        formData,
      ),
    ),
    {},
  );

  if (!security.emailCodes && !security.canUseEmailCodes) {
    return (
      <Text color="fg.muted" fontSize="sm" marginTop={2}>
        Add and confirm an email address above to use email sign-in codes.
      </Text>
    );
  }

  return (
    <>
      <PasswordForm
        action={action}
        label={
          security.emailCodes ? "Turn off email codes" : "Turn on email codes"
        }
        pending={pending}
        state={state}
        username={username}
      >
        <input
          name="mode"
          type="hidden"
          value={security.emailCodes ? "off" : "on"}
        />
      </PasswordForm>
      <BackupCodes codes={state?.backupCodes} />
    </>
  );
}

function Backup({ security, username }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    withRefresh(router, regenerateBackupCodes),
    {},
  );

  if (!security.hasBackupCodes) {
    return (
      <Text color="fg.muted" fontSize="sm" marginTop={2}>
        You'll get backup codes when you turn on an authenticator app or email
        codes.
      </Text>
    );
  }

  return (
    <>
      <Text fontSize="sm" marginTop={2}>
        {security.backupCodesRemaining} unused backup codes left.
      </Text>
      <PasswordForm
        action={action}
        label="Make new backup codes"
        pending={pending}
        state={state}
        username={username}
      />
      <BackupCodes codes={state?.backupCodes} />
    </>
  );
}

function Passkey({ passkey, username }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [notice, setNotice] = useState(null);
  const [state, action, pending] = useActionState(
    withRefresh(router, renamePasskey),
    {},
  );

  const remove = async () => {
    const result = await deletePasskey(username, passkey.id);
    setNotice(result?.error ? { error: { general: result.error } } : result);
    if (result?.success) router.refresh();
  };

  return (
    <Box marginTop={4}>
      <Stack alignItems="center" direction="row" wrap="wrap">
        <Text fontSize="sm">{passkey.name || "Passkey"}</Text>
        {passkey.createdAt ? (
          <Text color="fg.muted" fontSize="sm">
            added {new Date(passkey.createdAt).toLocaleDateString()}
          </Text>
        ) : null}
        <Button
          color="fg"
          onClick={() => setRenaming(!renaming)}
          size="xs"
          variant="outline"
        >
          Rename
        </Button>
        <Button color="fg" onClick={remove} size="xs" variant="outline">
          Remove
        </Button>
      </Stack>
      {renaming && !state?.success ? (
        <form action={action}>
          <input name="username" type="hidden" value={username} />
          <input name="id" type="hidden" value={passkey.id} />
          <Stack direction="row" marginTop={2}>
            <Input
              defaultValue={passkey.name ?? ""}
              maxLength={100}
              name="name"
              size="sm"
            />
            <Button
              color="fg"
              disabled={pending}
              size="sm"
              type="submit"
              variant="outline"
            >
              Save
            </Button>
          </Stack>
        </form>
      ) : null}
      <Message
        state={
          state?.error?.name ? { error: { general: state.error.name } } : state
        }
      />
      <Message state={notice} />
    </Box>
  );
}

function Passkeys({ security, username }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [notice, setNotice] = useState(null);

  const add = async () => {
    const { error } = await authClient.passkey.addPasskey({
      name: name.trim() || undefined,
    });
    if (error) {
      setNotice({
        error: {
          general:
            error.code === "SESSION_NOT_FRESH" || error.status === 403
              ? "For your security, log out and log in again, then add the passkey within 10 minutes."
              : error.message || "Couldn't add the passkey.",
        },
      });
    } else {
      setName("");
      setNotice({ success: "Passkey added." });
      router.refresh();
    }
  };

  return (
    <>
      <Text fontSize="sm" marginTop={2}>
        Log in with your device's fingerprint, face or screen lock instead of
        your password. Logging in with a passkey doesn't ask for a code.
      </Text>
      {security.passkeys.map((passkey) => (
        <Passkey key={passkey.id} passkey={passkey} username={username} />
      ))}
      <Field.Root marginTop={6}>
        <Field.Label className={geistMono.className}>Passkey name</Field.Label>
        <Input
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My laptop"
          size="lg"
          value={name}
        />
      </Field.Root>
      <Button
        color="fg"
        marginTop={4}
        onClick={add}
        size="sm"
        variant="outline"
      >
        Add a passkey
      </Button>
      <Message state={notice} />
    </>
  );
}

export default function SecuritySettings({ account }) {
  const { security, username } = account;

  return (
    <>
      <Text fontSize="sm">
        Ask for a code as well as your password when you log in. You can use an
        authenticator app, codes sent to your email, or both.
      </Text>

      <Box marginTop={6}>
        <Stack alignItems="center" direction="row">
          <Label>Authenticator app</Label>
          <OnOff on={security.totp} />
        </Stack>
        <Totp security={security} username={username} />
      </Box>

      <Box marginTop={8}>
        <Stack alignItems="center" direction="row">
          <Label>Email codes</Label>
          <OnOff on={security.emailCodes} />
        </Stack>
        <EmailCodes security={security} username={username} />
      </Box>

      <Box marginTop={8}>
        <Label>Backup codes</Label>
        <Backup security={security} username={username} />
      </Box>

      <Box marginTop={8}>
        <Label>Passkeys</Label>
        <Passkeys security={security} username={username} />
      </Box>
    </>
  );
}
