"use client"

// next imports
import Image from "next/image";

// form validation imports
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  basicsSchema,
  broadcastSchema,
  esimSchema,
  helpdeskSchema,
  tiplineSchema,
  vpnSchema
} from "../lib/forms";

// style imports
import styles from "../page.module.css";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  createListCollection,
  Flex,
  Group,
  Heading,
  HStack,
  Icon,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field"

// component imports
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/components/ui/radio-card"
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsRoot,
} from "@/components/ui/steps"

import { BasicsForm } from "@/components/forms/basics";
import { BroadcastForm } from "@/components/forms/broadcast";
import { EsimForm } from "@/components/forms/esim";
import { HelpdeskForm } from "@/components/forms/helpdesk";
import { TiplineForm } from "@/components/forms/tipline";
import { VpnForm } from "@/components/forms/vpn";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";
import { useEffect, useState } from "react";

const frameworks = [
  {
    value: "broadcast",
    title: "Broadcast",
    description: "Send messages to many recipients while protecting the privacy of both senders and recipients.",
    icon: <TbBuildingBroadcastTower />
  },
  {
    value: "tipline",
    title: "Tipline",
    description: "Set up an automated system to receive tips anonymously and securely.",
    icon: <LuLightbulb />
  },
  {
    value: "helpdesk",
    title: "Helpdesk",
    description: "Set up an automated system to answer questions anonymously and securely.",
    icon: <IoHelpBuoySharp />
  },
  {
    value: "esim",
    title: "eSIM",
    description: "Distribute eSIMS to users who request codes with anonymity.",
    icon: <FaSimCard />
  },
  {
    value: "vpn",
    title: "VPN",
    description: "Distribute VPN codes to users who request the codes with anonymity.",
    icon: <CgModem />
  },
]

export default function Home() {
  const [botType, setBotType] = useState("broadcast");

  // set the path that a user takes depending on which bot type they select
  const updateBotType = (event) => {
    setBotType(event.target.value)
  };

  // form validation
  const { register, handleSubmit, errors } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(`${botType}Schema`),
  });

  const validateForm = async (event) => {
    console.log(event);
  }

  useEffect(() => { }, [botType]);

  return (
    <Box>
      <Container py={6}>
        <Flex justifyContent="space-between">
          <ColorModeButton />
          <Button>
            Donate
          </Button>
        </Flex>
      </Container>
      <Container marginBottom={6} maxW="4xl">
        <Heading as="h1" marginBottom={4} size="xl">
          Create a new bot
        </Heading>
        <StepsRoot
          count={3}
          defaultValue={1}
          onStepComplete={validateForm}
        >
          <StepsList>
            <StepsItem index={0} title="Choose your bot type" />
            <StepsItem index={1} title="Name your bot" />
            <StepsItem index={2} title="Customize your bot" />
          </StepsList>
          <StepsContent index={0}>
            <Heading as="h2" marginTop={10} size="md">
              What kind of bot do you want to create?
            </Heading>
            <RadioCardRoot
              align="center"
              defaultValue="broadcast"
              justify="center"
              marginY={6}
              maxW="4xl"
              onChange={updateBotType}
              orientation="vertical"
              value={botType}
            >
              <RadioCardLabel>Choose your bot type:</RadioCardLabel>
              <Stack
                align="stretch"
                direction={["column", "row"]}
                flexWrap="wrap"
                gap={4}
                justifyContent="center"
                marginTop={3}
              >
                {frameworks.map((item) => (
                  <RadioCardItem
                    label={item.title}
                    description={item.description}
                    icon={
                      <Icon fontSize="2xl" color="fg.subtle">
                        {item.icon}
                      </Icon>
                    }
                    indicator={false}
                    key={item.value}
                    maxWidth={300}
                    minWidth={300}
                    width={300}
                    value={item.value}
                  />
                ))}
              </Stack>
            </RadioCardRoot>
          </StepsContent>
          <StepsContent index={1}>
            <Heading
              as="h3"
              marginBottom={4}
              marginTop={10}
              size="md"
            >
              Building {botType} bot
            </Heading>
            <BasicsForm schema={basicsSchema} />
          </StepsContent>
          <StepsContent index={2}>
            <Heading
              as="h3"
              marginBottom={4}
              marginTop={10}
              size="md"
            >
              Building {botType} bot
            </Heading>
            {botType == "broadcast" ? (
              <>
                <BroadcastForm schema={broadcastSchema} />
              </>
            ) : botType == "esim" ? (
              <>
                <EsimForm schema={esimSchema} />
              </>
            ) : botType == "helpdesk" ? (
              <>
                <HelpdeskForm schema={helpdeskSchema} />
              </>
            ) : botType == "tipline" ? (
              <>
                <TiplineForm schema={tiplineSchema} />
              </>
            ) : botType == "vpn" ? (
              <>
                <VpnForm schema={vpnSchema} />
              </>
            ) : (
              <>
                <Text>
                  Something went wrong. Please contact a system administrator: no bot type selected.
                </Text>
              </>
            )}
          </StepsContent>
          <StepsCompletedContent>Please double check that the following information is correct. You will not be able to update this later.</StepsCompletedContent>
          <Group>
            <StepsPrevTrigger asChild>
              <Button variant="outline" size="sm">
                Prev
              </Button>
            </StepsPrevTrigger>
            <StepsNextTrigger asChild>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </StepsNextTrigger>
          </Group>
        </StepsRoot>
      </Container>
    </Box>
  );
}
