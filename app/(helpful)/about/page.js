"use client";

// base imports
import React from "react";
import { useSession } from "next-auth/react";

// chakra ui imports
import {
  Box,
  ClientOnly,
  Container,
  Flex,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";

// component imports
import ArtFooter from "@/app/_components/artFooter";
import Footer from "@/app/_components/footer";
import Header from "@/app/_components/header";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// fonts
import { funnel } from "@/app/fonts";

export default function About() {
  // session
  const { data: session } = useSession();

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");

  return (
    <Box paddingBottom={8}>
      <Container py={6}>
        <Header session={session} />
      </Container>
      <Container maxW="6xl" marginBottom={8}>
        <Flex direction={["column-reverse", "column-reverse", "row"]} gap={8}>
          <Box
            height={[360, 360, 400]}
            marginLeft="auto"
            marginRight="auto"
            marginTop={8}
            width={["90%", 400, 460]}
          >
            <ArtFooter />
          </Box>
          <Box>
            <Heading
              as="h1"
              className={funnel.className}
              marginTop={[0, 0, 8]}
              size="5xl"
            >
              About us
            </Heading>
            <ClientOnly>
              <Text marginTop={6}>
                Bitpart is a project developed by{" "}
                <Link color={color} href="https://throneless.tech">
                  Throneless Tech
                </Link>
                , a technology worker-cooperative specialized in building
                technology and providing digital security trainings for social
                justice oriented community organizations, activist groups, and
                non-profits.
              </Text>
              <Text marginTop={2}>
                We were inspired to develop Bitpart by the need we saw for it
                within communities we are a part of and work with. Dormant,
                similar projects such as Ionosphere and Signalboost also brought
                us inspiration.
              </Text>
              <Text marginTop={2}>
                Bitpart has been made possible through a grant and support from
                the Open Technology Fund (OTF), which in turn receives funding
                from the US government. You can read more about OTF's funding{" "}
                <Link
                  color={color}
                  href="https://www.opentech.fund/about/about-our-funding/"
                >
                  here
                </Link>
                . Many privacy-focused technologies have received funding from
                OTF, such as{" "}
                <Link color={color} href="https://signal.org/">
                  Signal
                </Link>
                ,{" "}
                <Link color={color} href="https://tails.net/">
                  Tails
                </Link>
                , and{" "}
                <Link color={color} href="https://www.torproject.org/">
                  Tor.
                </Link>
              </Text>
              <Text marginTop={2}>
                If you have any feedback, or want to know more, please contact
                us:{" "}
                <Link color={color} href="mailto:contact@bitp.art">
                  contact@bitp.art
                </Link>
              </Text>
            </ClientOnly>
          </Box>
        </Flex>
      </Container>
      <Footer color={color} />
    </Box>
  );
}
