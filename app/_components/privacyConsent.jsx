"use client";

// base imports
import { useState } from "react";

// chakra ui imports
import { Box, Button, Dialog, Portal, Link, Text } from "@chakra-ui/react";

// components imports
import { useColorModeValue } from "@/app/_components/ui/color-mode";
import { updateUserConsent } from "../_actions/getUser";

export default function PrivacyConsent({ setConsentAgree, username }) {
  const [open, setOpen] = useState(true);

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  // submit form
  async function updateConsent() {
    try {
      const updated = await updateUserConsent(username);
      setOpen(false);
      setConsentAgree(true);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size="cover"
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Agree to TOU and privacy policy here
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Consent to terms of use and privacy policy
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text marginTop={4}>
                In order to use Bitpart, we require active consent to our terms
                of use and privacy policy.
              </Text>
              <Text marginTop={4}>
                You can read the{" "}
                <Link
                  color={color}
                  href="/tou-and-privacy#tou"
                  target="_blank"
                  variant="underline"
                >
                  terms of use here
                </Link>{" "}
                and the{" "}
                <Link
                  color={color}
                  href="/tou-and-privacy#privacy-policy"
                  target="_blank"
                  variant="underline"
                >
                  privacy policy here
                </Link>
                .
              </Text>
              <Text fontSize={16} fontWeight={700} marginTop={12}>
                Do you agree to the terms of use and privacy policy?
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">No, take me back</Button>
              </Dialog.ActionTrigger>
              <form action={updateConsent}>
                <Button type="submit">Yes, I agree</Button>
              </form>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
