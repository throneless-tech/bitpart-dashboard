"use client";

// base imports
import React, { Suspense } from "react";
import { useSession } from "next-auth/react";

// chakra ui imports
import {
  Box,
  Button,
  ClientOnly,
  Container,
  Heading,
  Link,
  List,
  Text,
} from "@chakra-ui/react";

// components
import { useColorModeValue } from "@/app/_components/ui/color-mode";
import { ToastSignOut } from "./_components/toastalert";
import Header from "./_components/header";

export default function Home() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Suspense>
        <ToastSignOut />
      </Suspense>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container marginBottom={6} maxW="2xl">
        <Heading as="h1" marginTop={8} size="3xl" textAlign="center">
          Welcome to Bitpart.
        </Heading>
        <Text marginTop={4}>
          Bitpart is a messaging tool designed for human rights organizations,
          activists, journalists and human rights defenders working in
          repressive political environments at risk of surveillance.
        </Text>
        <Text marginTop={2}>
          It enables you to send secure, automated messages to a particular
          community over Signal by creating your own bot. The bot can operate
          within five different communication formats, depending on your needs,
          all while protecting the privacy of both the senders and recipients of
          messages.
        </Text>
        <Text marginTop={2}>These formats include:</Text>
        <List.Root marginLeft={8}>
          <List.Item>
            <Text as="span" fontWeight="bold">
              Broadcasting:{" "}
            </Text>
            send alerts and other information to many recipients at once
          </List.Item>
          <List.Item>
            <Text as="span" fontWeight="bold">
              Tipline:{" "}
            </Text>
            set up a channel to receive tips from anonymous senders
          </List.Item>
          <List.Item>
            <Text as="span" fontWeight="bold">
              Helpdesk:{" "}
            </Text>
            set up a channel to receive questions and respond to them
          </List.Item>
          <List.Item>
            <Text as="span" fontWeight="bold">
              eSim distribution:{" "}
            </Text>
            distribute eSims to members of your community
          </List.Item>
          <List.Item>
            <Text as="span" fontWeight="bold">
              VPN distribution:{" "}
            </Text>
            distribute VPN codes to members of your community
          </List.Item>
        </List.Root>
        <Box marginTop={8} textAlign="center">
          <Text marginBottom={8}>Ready to go?</Text>
          <Button as="a" href="/signup" marginTop={4}>
            Get started
          </Button>
          <Text marginTop={8} fontStyle="italic" textStyle="sm">
            Contact us if you have questions or need a code:{" "}
            <ClientOnly>
              <Link color={color} href="mailto:contact@bitp.art">
                contact [at] bitp.art
              </Link>
            </ClientOnly>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
