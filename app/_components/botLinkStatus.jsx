"use client";

import { useCallback, useEffect, useState } from "react";

// chakra ui imports
import {
  CloseButton,
  Dialog,
  Portal,
  Spinner,
  Stack,
  Status,
  Text,
} from "@chakra-ui/react";

// actions
import { getBotStatus, relinkBot } from "@/app/_actions/linkBot";

// components imports
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";
import LinkInstructions from "@/app/_components/linkInstructions";

const statuses = {
  linked: { color: "green", label: "Linked" },
  unlinked: { color: "gray", label: "Not linked" },
  failing: { color: "red", label: "Failing" },
  unknown: { color: "yellow", label: "Unknown" },
};

export default function BotLinkStatus({ bot, username }) {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const [qrLink, setQRLink] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  const color = useColorModeValue("purple.600", "purple.400");

  const fetchStatus = useCallback(async () => {
    try {
      setStatus(await getBotStatus(bot.id, username));
    } catch (error) {
      console.log(error);
      setStatus("unknown");
    }
  }, [bot.id, username]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRelink = async () => {
    setOpen(true);
    setIsLinking(true);
    setLinkError("");
    setQRLink("");

    try {
      const response = await relinkBot(bot.id, username);
      setQRLink(response.qr);
      console.log(response.qr);
    } catch (error) {
      console.log(error);
      setLinkError(
        "A server error occurred while trying to re-link this bot. Please contact an admin for assistance.",
      );
    } finally {
      setIsLinking(false);
    }
  };

  const handleOpenChange = (e) => {
    setOpen(e.open);

    if (!e.open) {
      fetchStatus();
    }
  };

  const current = statuses[status];

  return (
    <>
      <Stack alignItems="center" direction="row" marginTop={2}>
        {current ? (
          <Status.Root
            aria-label={`Signal: ${current.label.toLowerCase()}`}
            colorPalette={current.color}
          >
            <Status.Indicator />
            Signal: {current.label}
          </Status.Root>
        ) : (
          <>
            <Spinner size="xs" />
            <Text>Checking Signal status...</Text>
          </>
        )}
      </Stack>
      {status === "failing" || status === "unlinked" ? (
        <Button
          color="fg"
          marginTop={2}
          onClick={handleRelink}
          size="sm"
          variant="outline"
          width="fit-content"
        >
          Re-link this bot
        </Button>
      ) : null}
      {bot.lastSendStatus === "challenge_required" ? (
        <Button
          as="a"
          color="fg"
          href={`/my-bots/challenge/${bot.id}`}
          marginTop={2}
          size="sm"
          variant="outline"
          width="fit-content"
        >
          Solve captcha
        </Button>
      ) : null}
      <Dialog.Root lazyMount open={open} onOpenChange={handleOpenChange}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Re-link {bot.botName} to Signal</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {isLinking ? (
                  <Stack alignItems="center">
                    <Spinner size="xl" />
                    <Text>Generating a new QR code...</Text>
                  </Stack>
                ) : linkError ? (
                  <Text>{linkError}</Text>
                ) : (
                  <LinkInstructions color={color} qrLink={qrLink} />
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button color="fg" variant="outline">
                    Done
                  </Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
