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

// component imports
import { useColorModeValue } from "@/app/components/ui/color-mode";
import Header from "../components/headerOuter";

export default function About() {
  // color mode
  const color = useColorModeValue("maroon", "yellow");

  return (
    <Box>
      <Container py={6}>
        <Header />
      </Container>
      <Container maxW="3xl" py={6}>
        <Heading
          as='h1'
          marginTop={8}
          size='3xl'
          textAlign='center'
        >
          About us
        </Heading>
        <ClientOnly>
          <Text marginTop={6}>
            Bitpart is a project developed by{' '}
            <Link color={color} href="https://throneless.tech" variant="underline">
              Throneless Tech
            </Link>, a technology worker-cooperative specialized in building technology and providing digital security trainings for social justice oriented community organizations, activist groups, and non-profits.
          </Text>
          <Text marginTop={2}>
            We were inspired to develop Bitpart by the need we saw for it within communities we are a part of and work with; and also dormant projects like Ionosphere and Signalboost.
          </Text>
          <Text marginTop={2}>
            Bitpart has been made possible through a grant and support from the Open Technology Fund (OTF), which in turn receives funding from the US government. You can read more about OTF's funding{' '}
            <Link color={color} href="https://www.opentech.fund/about/about-our-funding/" variant="underline">
              here
            </Link>. Many privacy-focused technologies have received funding from OTF, such as{' '}
            <Link color={color} href="https://signal.org/" variant="underline">
              Signal
            </Link>,{' '}
            <Link color={color} href="https://tails.net/" variant="underline">
              Tails
            </Link>
            , and{' '}
            <Link color={color} href="https://www.torproject.org/" variant="underline">
              Tor.
            </Link>
          </Text>
          <Text marginTop={2}>
            If you have any feedback, or want to know more, please contact us:{' '}
            <Link color={color} href="mailto:contact@bitp.art" variant="underline">
              contact@bitp.art
            </Link>
          </Text>
        </ClientOnly>
      </Container>
    </Box>
  );
}
