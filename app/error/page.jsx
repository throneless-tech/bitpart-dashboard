"use client";

// base imports
import React from "react";
import { useSearchParams } from "next/navigation";

// chakra ui imports
import {
  Box,
  Code,
  Container,
  Heading,
  HStack,
  Link,
  Text,
} from "@chakra-ui/react";

// icons
import { FaArrowLeftLong } from "react-icons/fa6";

export default function AuthErrorPage() {
  const search = useSearchParams();
  const error = search.get("error");

  return (
    <Box className="flex h-screen w-full flex-col items-center justify-center">
      <Container marginY={12} maxWidth="lg">
        <Heading as="h1">Something went wrong</Heading>
        <Box>
          <Text marginTop={6}>
            There was a problem when trying to authenticate. Please contact us
            if this error persists. Unique error code:{" "}
            <Code className="rounded-sm bg-slate-100 p-1 text-xs">{error}</Code>
          </Text>
          <Text as="div" marginTop={2}>
            <HStack alignItems="flex-start">
              <Box as="span" marginTop="2px">
                <FaArrowLeftLong />
              </Box>
              <Link href="/login" variant="underline">
                Return to login
              </Link>
            </HStack>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
