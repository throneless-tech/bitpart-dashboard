"use client";

// base imports
import React from "react";
import { useSession } from "next-auth/react";

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
import Header from "../components/header";

export default function FAQ() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginY={8} maxW="3xl">
        <Heading as="h1" size="2xl">
          FAQs
        </Heading>
        <List.Root marginLeft={4}>
          <ClientOnly>
            <List.Item>
              <Link color={color} href="#broadcast" variant="underline">
                Broadcast
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#helpdesk" variant="underline">
                Helpdesk
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#tipline" variant="underline">
                Tipline
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#esim" variant="underline">
                eSIM distribution
              </Link>
            </List.Item>
            <List.Item>
              <Link color={color} href="#vpn" variant="underline">
                VPN distribution
              </Link>
            </List.Item>
          </ClientOnly>
        </List.Root>
        <Heading as="h2" id="broadcast" marginTop={4}>
          Broadcast
        </Heading>
        <Heading as="h2" id="helpdesk" marginTop={4}>
          Helpdesk
        </Heading>
        <Heading as="h2" id="tipline" marginTop={4}>
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
        <Heading as="h2" id="esim" marginTop={4}>
          eSIM distribution
        </Heading>
        <Heading as="h2" id="vpn" marginTop={4}>
          VPN distribution
        </Heading>
      </Container>
    </Box>
  );
}
