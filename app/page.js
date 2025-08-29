"use client";

// base imports
import React, { Suspense } from "react";
import { useSession } from "next-auth/react";

// fonts
import { funnel, geistMono } from "./fonts";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Container,
  Flex,
  Heading,
  Link,
  List,
  Text,
} from "@chakra-ui/react";

// components
import Art from "@/app/_components/art";
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";
import { ToastSignOut } from "./_components/toastalert";
import Header from "./_components/header";

export default function Home() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("black", "white");

  return (
    <Box>
      <Suspense>
        <ToastSignOut />
      </Suspense>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Flex
        direction={["column", "column", "row"]}
        gap={2}
        marginTop={[4, 4, 10]}
      >
        <Art />
        <Container marginBottom={6} maxW="2xl">
          <Heading
            as="h1"
            className={funnel.className}
            marginTop={[2, 4, 0]}
            size="6xl"
          >
            welcome to bitpart.
          </Heading>
          <Text marginTop={4}>
            Bitpart is a messaging tool designed for human rights organizations,
            activists, journalists and human rights defenders working in
            repressive political environments at risk of surveillance.
          </Text>
          <Text marginTop={2}>
            It enables you to send secure, automated messages to a particular
            community over Signal by creating your own bot. The bot can operate
            within five different communication formats, depending on your
            needs, all while protecting the privacy of both the senders and
            recipients of messages.
          </Text>
          <Text marginTop={8}>These formats include:</Text>
          <List.Root listStyle="none" marginTop={4}>
            <List.Item>
              <Text
                as="span"
                borderRight={`1px solid ${color}`}
                className={geistMono.className}
                textTransform="uppercase"
              >
                Broadcasting{" "}
              </Text>
              <Text as="span" paddingLeft={3}>
                Send alerts and other information to many recipients at once
              </Text>
            </List.Item>
            <List.Item marginTop={4}>
              <Text
                as="span"
                borderRight={`1px solid ${color}`}
                className={geistMono.className}
                textTransform="uppercase"
              >
                Tipline{" "}
              </Text>
              <Text as="span" paddingLeft={3}>
                Set up a channel to receive tips from anonymous senders
              </Text>
            </List.Item>
            <List.Item marginTop={4}>
              <Text
                as="span"
                borderRight={`1px solid ${color}`}
                className={geistMono.className}
                textTransform="uppercase"
              >
                Helpdesk{" "}
              </Text>
              <Text as="span" paddingLeft={3}>
                Set up a channel to receive questions and respond to them
              </Text>
            </List.Item>
            <List.Item marginTop={4}>
              <Text
                as="span"
                borderRight={`1px solid ${color}`}
                className={geistMono.className}
                textTransform="uppercase"
              >
                eSim distribution{" "}
              </Text>
              <Text as="span" paddingLeft={3}>
                Distribute eSims to members of your community
              </Text>
            </List.Item>
            <List.Item marginTop={4}>
              <Text
                as="span"
                borderRight={`1px solid ${color}`}
                className={geistMono.className}
                textTransform="uppercase"
              >
                VPN distribution{" "}
              </Text>
              <Text as="span" paddingLeft={3}>
                Distribute VPN codes to members of your community
              </Text>
            </List.Item>
          </List.Root>
          <Box marginTop={10} textAlign="center">
            <Text marginBottom={4}>Ready to go?</Text>
            <Button as="a" colorPalette="purple" href="/signup" marginTop={4}>
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
      </Flex>
    </Box>
  );
}
