"use client";

// base imports
import React from "react";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Container,
  Heading,
  Link,
  List,
  Text,
} from "@chakra-ui/react";

// components imports
import { useColorModeValue } from "@/app/components/ui/color-mode";

export default function FAQ() {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Container marginY={8} maxW="3xl">
        <Heading as="h1" size="2xl">
          FAQs
        </Heading>
        <List.Root marginLeft={4}>
          <List.Item>
            <Link>Tipline</Link>
          </List.Item>
        </List.Root>
        <Heading as="h2" marginTop={4}>
          Tipline
        </Heading>
        <Text fontWeight={700} marginTop={4}>
          You will be able to see all tips on the device which uses the Signal
          account that your bot is linked to.
        </Text>
        <Text marginTop={4}>
          Bitpart can also forward tips to another Signal account, which can
          help identify tips. We recommend not using your personal one due to
          the potential sensitivity of tips. Try to use a new phone number and
          Signal account.
        </Text>
        <Text marginTop={4}>
          To set up forwarding, please Signal message the your passcode to the
          bot from the account on which you'd like to receive the tips:
        </Text>
        <Text marginTop={4}>
          If you want to stop receiving forwarded tips, sending "Delete" to your
          bot will erase the conversation and thus Bitpart's memory of you
          sending the passcode.
        </Text>
        <Text marginTop={4}>
          You will be able to find the passcode again later in your dashboard on
          this website.
        </Text>
        <Text marginTop={4}>
          Teammates can also receive forwarded messages requiring human support.
          They can do this in 2 ways:
        </Text>
        <Text marginTop={4}>
          Either 1. Using the passcode: They should open Signal on their device
          and send the same passcode to your tipline bot.
        </Text>
        <ClientOnly>
          <Text marginTop={4}>
            Or 2. Linking devices: Link a desktop or iPad version of Signal to
            the Signal account you are using for receiving the forwarded
            messages. Here's guidance on how to do this:{" "}
            <Link
              color={color}
              href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
              target="_blank"
            >
              support.signal.org/hc/en-us/articles/360007320551-Linked-Devices
            </Link>
          </Text>
        </ClientOnly>
        <Text marginTop={4}>
          Remember -- the passcode gives someone access to receive messages from
          people using your bot. Please keep it safe.
        </Text>
      </Container>
    </Box>
  );
}
