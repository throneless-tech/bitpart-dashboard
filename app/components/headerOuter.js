"use client";

// base imports
import React from "react";

// chakra ui imports
import { Box, Button, ClientOnly, Flex, HStack, Link } from "@chakra-ui/react";

// component imports
import {
  ColorModeButton,
  useColorModeValue,
} from "@/app/components/ui/color-mode";

export default function Header() {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Flex justifyContent="space-between">
        <ClientOnly>
          <HStack gap={6}>
            <ColorModeButton />
            <Link color={color} href="/" variant="underline">
              Home
            </Link>
            <Link color={color} href="/about" variant="underline">
              About us
            </Link>
            <Link color={color} href="/tos-and-privacy" variant="underline">
              Terms of use and privacy
            </Link>
          </HStack>
          <HStack gap={8}>
            <Link color={color} href="/login" variant="underline">
              Login
            </Link>
            <Button>Donate</Button>
          </HStack>
        </ClientOnly>
      </Flex>
    </Box>
  );
}
