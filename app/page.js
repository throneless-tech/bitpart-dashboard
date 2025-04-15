"use client"

// base imports
import React from "react";

// chakra ui imports
import {
  Box,
  Button,
  ClientOnly,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Text
} from "@chakra-ui/react";

// components
import { ColorModeButton, useColorModeValue } from "@/app/components/ui/color-mode";
import { InviteForm } from "./components/enterInvite";
import { ToastSignOut } from "./components/toastalert";

export default function Home() {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <ToastSignOut />
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <HStack gap={8}>
            <ClientOnly>
              <Link color={color} href="/login" variant="underline">
                Login
              </Link>
            </ClientOnly>
            <Button>
              Donate
            </Button>
          </HStack>
        </Flex>
      </Container>
      <Container marginBottom={6} maxW="2xl">
        <Heading
          as='h1'
          marginTop={8}
          size='3xl'
          textAlign='center'
        >
          Welcome to Bitpart.
        </Heading>
        <Text marginTop={4}>
          Bitpart is... they used to say that if Man was meant to fly, he'd have wings. But he did fly. He discovered he had to. Leave bigotry in your quarters; there's no room for it on the bridge. To all mankind -- may we never find space so vast, planets so cold, heart and mind so empty that we cannot fill them with love and warmth. You know the greatest danger facing us is ourselves, and irrational fear of the unknown. There is no such thing as the unknown.
        </Text>
        <Box marginTop={4} textAlign='center'>
          <Text marginBottom={8}>
            Ready to get started? Enter your invite code below:
          </Text>
          <InviteForm />
        </Box>
      </Container>
    </Box>
  )
}