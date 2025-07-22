"use client";

// base imports
import React from "react";
import { auth } from "@/auth";

// chakra ui imports
import {
  Box,
  Button,
  ButtonGroup,
  Code,
  Container,
  Stack,
  Steps,
  useSteps,
} from "@chakra-ui/react";

// component imports
import CreateBotFlow from "@/app/_components/create";
import Header from "@/app/_components/header";
import NotAuthenticated from "@/app/_components/notAuthenticated";

export default function CreateStep1() {
  // const steps = useSteps({
  //   defaultStep: 1,
  //   count: items.length,
  // })

  return (
    <Box>
      <Stack align="flex-start">
        <Code>current step: 1</Code>
        <Steps.RootProvider value={1}>
          <Steps.List>
            {items.map((step, index) => (
              <Steps.Item key={index} index={index} title={step.title}>
                <Steps.Indicator />
                <Steps.Title>{step.title}</Steps.Title>
                <Steps.Separator />
              </Steps.Item>
            ))}
          </Steps.List>
          {items.map((step, index) => (
            <Steps.Content key={index} index={index}>
              {step.description}
            </Steps.Content>
          ))}
          <Steps.CompletedContent>
            All steps are complete!
          </Steps.CompletedContent>

          <ButtonGroup size="sm" variant="outline">
            <Steps.PrevTrigger asChild>
              <Button>Prev</Button>
            </Steps.PrevTrigger>
            <Steps.NextTrigger asChild>
              <Button>Next</Button>
            </Steps.NextTrigger>
          </ButtonGroup>
        </Steps.RootProvider>
      </Stack>
    </Box>
  );
}

const items = [
  {
    title: "Step 1",
    description: "Step 1 description",
  },
  {
    title: "Step 2",
    description: "Step 2 description",
  },
  {
    title: "Step 3",
    description: "Step 3 description",
  },
];
