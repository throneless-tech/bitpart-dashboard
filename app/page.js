import Image from "next/image";
import styles from "./page.module.css";

// chakra ui imports
import {
  Box,
  Button,
  Container,
  createListCollection,
  Flex,
  Group,
  Heading,
  Input,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field"

// component imports
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsRoot,
} from "@/components/ui/steps"

const frameworks = createListCollection({
  items: [
    { label: "Broadcast", value: "broadcast" },
    { label: "Help Desk", value: "helpdesk" },
    { label: "Tip Line", value: "tipline" },
    { label: "VPN", value: "vpn" },
  ],
})

export default function Home() {
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
      <Container>
        <Heading as="h1" marginBottom={4} size="xl">
          Create a new bot
        </Heading>
        <StepsRoot defaultValue={1} count={3}>
          <StepsList>
            <StepsItem index={0} title="Choose your bot type" />
            <StepsItem index={1} title="Name your bot" />
            <StepsItem index={2} title="Customize your bot" />
          </StepsList>
          <StepsContent index={0}>
            <Heading as="h2" size="md">
              What type of bot do you want to create?
            </Heading>
            <SelectRoot size="sm" width="320px">
              <SelectLabel>Select a bot framework</SelectLabel>
              <SelectTrigger>
                <SelectValueText placeholder="Choose one" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.items.map((type) => (
                  <SelectItem item={type} key={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </StepsContent>
          <StepsContent index={1}>
            <Field label="Name" marginBottom={6} width="320px">
              <Input placeholder="Enter a name for your bot..." />
            </Field>
          </StepsContent>
          <StepsContent index={2}>Here is where we would add fields to customize the bot as needed, based on the type of bot selected.</StepsContent>
          <StepsCompletedContent>Now the steps are complete, and this is where we would submit the info to Bitpart to create a new bot.</StepsCompletedContent>
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
