"use client";

// base imports
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// form validation imports
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../_lib/forms";

// chakra ui imports
import {
  AbsoluteCenter,
  Box,
  Container,
  Dialog,
  Flex,
  Group,
  Heading,
  Highlight,
  Icon,
  Link,
  List,
  Portal,
  QrCode,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

// component imports
import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { LightMode, useColorModeValue } from "@/app/_components/ui/color-mode";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/app/_components/ui/radio-card";
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsNextTrigger,
  StepsPrevTrigger,
} from "@/app/_components/ui/steps";
const StepsRoot = dynamic(() => import("@/app/_components/ui/steps"), {
  ssr: false,
});

// form imports
import { BasicsForm } from "@/app/_components/forms/basics";
import { BroadcastForm } from "@/app/_components/forms/broadcast";
import { EsimForm } from "@/app/_components/forms/esim";
import { HelpdeskForm } from "@/app/_components/forms/helpdesk";
import { Summary } from "@/app/_components/forms/summary";
import { TiplineForm } from "@/app/_components/forms/tipline";
import { VpnForm } from "@/app/_components/forms/vpn";

// confirmation pages
import { BroadcastConfirmation } from "./confirmation/broadcast";
import { EsimConfirmation } from "./confirmation/esim";
import { HelpdeskConfirmation } from "./confirmation/helpdesk";
import { TiplineConfirmation } from "./confirmation/tipline";
import { VpnConfirmation } from "./confirmation/vpn";

// icons imports
import Bullhorn from "@/app/_icons/bullhorn";
import Chart from "@/app/_icons/chart";
import Helpdesk from "@/app/_icons/helpdesk";
import Info from "@/app/_icons/info";
import Lightbulb from "@/app/_icons/lightbulb";
import Phone from "@/app/_icons/phone";

// actions
import {
  createBotBitpart,
  createBotPrisma,
  linkChannelBitpart,
} from "@/app/_actions/createBot";
import { createPasscode, formatBotName } from "@/app/_actions/formatBot";
import { parseCSV } from "@/app/_actions/csv";
import { getUserBots } from "@/app/_actions/getUserBots";

// constants
import { MAX_BOTS } from "@/app/constants";

// fonts
import { funnel, geistMono } from "../fonts";

const frameworks = [
  {
    value: "broadcast",
    title: "Broadcast",
    description:
      "Send messages to many recipients while protecting the privacy of both senders and recipients.",
    icon: <Bullhorn />,
  },
  {
    value: "tipline",
    title: "Tipline",
    description: "Set up an automated system to receive tips.",
    icon: <Lightbulb />,
  },
  {
    value: "helpdesk",
    title: "Helpdesk",
    description: "Set up an automated system to answer questions.",
    icon: <Helpdesk />,
  },
  {
    value: "esim",
    title: "eSIM",
    description: "Distribute eSIMs to people who request codes.",
    icon: <Phone />,
  },
  {
    value: "vpn",
    title: "VPN",
    description: "Distribute VPN codes to people who request them.",
    icon: <Chart />,
  },
];

const valuesToUnregister = [
  "about",
  "activationInstructions",
  // 'adminPhones',
  "csv",
  "description",
  "faq",
  "helpInstructions",
  "locations",
  "maxCodes",
  // 'plans',
  "privacyPolicy",
  "problems",
  "referral",
  "responseTime",
  "safetyTips",
  "storageAccess",
  "vpnName",
];

export default function CreateBotFlow({ username }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [createdBot, setCreatedBot] = useState(null);
  const [stepCount, setStepCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [botPasscode, setBotPasscode] = useState("");
  const [qrLink, setQRLink] = useState("");

  const step = searchParams.get("step");

  // ensure user has not maxed out the number of bots they can create
  useEffect(() => {
    async function fetchBots() {
      const fetched = await getUserBots(username);

      if (
        fetched?.user?.consent_agree === false ||
        fetched?.bots.length >= MAX_BOTS
      ) {
        setNotAllowed(true);
      }
    }
    fetchBots();
  }, []);

  useEffect(() => {}, [notAllowed]);

  // update the step count based on prev or next button
  const updateStepCount = (step) => {
    setStepCount((stepCount) => (stepCount += step));
    window.scrollTo(0, 0);
  };

  // update the step count based on prev or next browser step

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    if (step) {
      if (step > 4) {
        router.push("/my-bots");
      }
      setStepCount(parseInt(step));
    } else {
      router.push(`create?${createQueryString("step", "0")}`);
    }
  }, [step]);

  const methods = useForm({
    defaultValues: { botType: "broadcast" },
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const values = methods.getValues();

  const [botType] = methods.watch(["botType"]);

  const watchAll = methods.watch();

  const formState = methods.formState;

  // set the path that a user takes depending on which bot type they select, and unregister any previously registered but unneeded fields
  const updateBotType = (event) => {
    methods.setValue("botType", event.target.value);
    methods.clearErrors();
    methods.unregister(valuesToUnregister);
  };

  // submit bot creation for bitpart server and prisma db
  const onSubmit = async (data) => {
    setIsFetching(true);
    setOpen(true);
    const passcode = await createPasscode();
    setBotPasscode(passcode);

    try {
      // format bot id for bitpart
      const bitpartId = await formatBotName(data.botName, username);

      const botBitpart = await createBotBitpart(data, bitpartId, passcode);

      if (botBitpart?.message_type === "Error") {
        throw new Error(botBitpart.data.response);
      }

      let emsData;
      if (data.botType === "esim" || data.botType === "vpn") {
        emsData = parseCSV(
          botBitpart.data.response.bot.id,
          data.botType,
          data.csv,
        );
      }

      if (emsData?.error) {
        throw new Error(emsData.error.message);
      }

      const channelBitpartLink = await linkChannelBitpart(
        botBitpart.data.response.bot.id,
      );

      if (channelBitpartLink?.message_type === "Error") {
        throw new Error(channelBitpartLink.data.response);
      }

      setQRLink(channelBitpartLink.data.response);
      console.log(channelBitpartLink.data.response);

      const bot = await createBotPrisma(data, bitpartId, username, passcode);

      setCreatedBot(bot);
      updateStepCount(1);
    } catch (error) {
      console.log(error);
      alert(
        "A server error occurred while trying to create this bot. Please contact an admin for assistance.",
      );
      updateStepCount(-1);
      router.push(`?step=${stepCount - 1}`);
    } finally {
      setIsFetching(false);
      setOpen(false);
    }
  };

  // handle form submission errors
  const onError = (errors, e) => {
    console.log("errors prevented form from submitting: ", errors);
    alert(
      "Errors prevented form from submitting. See console or contact an admin for more information.",
    );
  };

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");
  const colorSteps = useColorModeValue("black", "white");

  useEffect(() => {}, [createdBot, isFetching, stepCount, watchAll]);

  if (notAllowed) {
    return (
      <Box>
        <Container marginTop={8} maxWidth="lg">
          <Text>
            You either have not consented to the privacy policy, or have reached
            the limit on how many bots a user may create.
          </Text>
          <Text marginTop={4}>
            Please{" "}
            <Link color={color} href="/my-bots" variant="underline">
              return to My Bots
            </Link>{" "}
            and either complete the privacy consent form, or delete a bot if you
            would like to create a new one.
          </Text>
        </Container>
      </Box>
    );
  } else {
    return (
      <Container marginBottom={6} maxW="6xl">
        <Heading
          as="h1"
          className={funnel.className}
          marginBottom={8}
          size="3xl"
        >
          Create a new bot
        </Heading>
        <FormProvider {...methods}>
          <StepsRoot count={4} linear step={stepCount} variant="subtle">
            <StepsList>
              <Stack direction={["column", "column", "row"]}>
                <StepsItem index={0} title="Choose your bot type" />
                <StepsItem index={1} title="Customize your bot" />
                <StepsItem index={2} title="Confirm your data" />
                <StepsItem index={3} title="Connect your bot" />
                <StepsItem index={4} title="Use your bot" />
              </Stack>
            </StepsList>
            <StepsContent
              index={0}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Box borderColor={color} borderWidth={1} margin={8} padding={4}>
                <Box display="inline-block" width={6}>
                  <Info color={color} />
                </Box>
                <Text>
                  The Bitpart bot connects to a Signal account to send and
                  receive messages. (Learn more about{" "}
                  <Link
                    href="/faq#how-does-bitpart-work"
                    color={color}
                    textDecoration="underline"
                    target="_blank"
                    variant="underline"
                  >
                    how Bitpart works
                  </Link>
                  .)
                </Text>
                <Text marginTop={4}>
                  Set up a{" "}
                  <Link
                    href="https://support.signal.org/hc/en-us/articles/360007318691-Register-a-phone-number"
                    color={color}
                    textDecoration="underline"
                    target="_blank"
                    variant="underline"
                  >
                    separate Signal account
                  </Link>
                  . You may need a separate SIM card and device or an online
                  number. Once the bot is activated, the bot responds to all
                  messages sent to that Signal account.{" "}
                  <Link
                    href="https://support.signal.org/hc/en-us/articles/360007318691-Register-a-phone-number"
                    color={color}
                    textDecoration="underline"
                    target="_blank"
                    variant="underline"
                  >
                    Learn more about why
                  </Link>{" "}
                  we don't recommend using your personal account.
                </Text>
              </Box>
              <Heading
                as="h2"
                className={geistMono.className}
                marginTop={10}
                size="md"
              >
                What kind of bot do you want to create?
              </Heading>
              <RadioCardRoot
                align="center"
                defaultValue={botType}
                justify="center"
                marginY={6}
                maxW="4xl"
                onChange={updateBotType}
                orientation="vertical"
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
                        <Box fill={color} width={6}>
                          {item.icon}
                        </Box>
                      }
                      indicator={false}
                      key={item.value}
                      maxWidth={300}
                      minWidth={300}
                      width={300}
                      value={item.value}
                      {...methods.register("botType")}
                    />
                  ))}
                </Stack>
              </RadioCardRoot>
            </StepsContent>
            <StepsContent
              index={1}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              {/* <Heading
                as="h3"
                marginBottom={4}
                marginTop={10}
                size="md"
              >
                Building {botType} bot
              </Heading> */}
              <BasicsForm />
              <Flex direction="row" gap={2} marginY={8}>
                <Box fill={color} marginTop="6px" width={10}>
                  <Info />
                </Box>
                <Text fontSize="md">
                  Anyone who has consented to receive messages from your bot
                  will be able to request to see a menu, which offers them the
                  option to learn about the bot. Fill out these sections below
                  to customize the text.
                </Text>
              </Flex>
              {botType == "broadcast" ? (
                <BroadcastForm />
              ) : botType == "esim" ? (
                <EsimForm />
              ) : botType == "helpdesk" ? (
                <HelpdeskForm />
              ) : botType == "tipline" ? (
                <TiplineForm />
              ) : botType == "vpn" ? (
                <VpnForm />
              ) : (
                <>
                  <Text>
                    Something went wrong. Please contact a system administrator:
                    no bot type selected.
                  </Text>
                </>
              )}
            </StepsContent>
            <StepsContent
              index={2}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Text marginTop={10}>Here is your new bot summary:</Text>
              <Summary data={values} errors={formState.errors} />
              <Text marginTop={10}>
                Does the above information look correct? If not, go back and
                update it. If so, click "Submit" to create your bot. You will be
                able to edit your bot again later if needed.
              </Text>
            </StepsContent>
            <StepsContent
              index={3}
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              <Heading as="h2" marginBottom={4} marginTop={10} size="md">
                Connect Bitpart to Signal
              </Heading>
              <LightMode>
                <Box backgroundColor="#fff" width={120}>
                  <QrCode.Root value={qrLink}>
                    <QrCode.Frame>
                      <QrCode.Pattern />
                    </QrCode.Frame>
                  </QrCode.Root>
                </Box>
              </LightMode>
              <List.Root marginLeft={4} marginTop={4}>
                <List.Item>
                  On your phone, open Signal and navigate to Signal Settings{" "}
                  {">"} Linked devices.
                </List.Item>
                <List.Item>Tap the blue button: "Link a new device"</List.Item>
                <List.Item>Use your phone to scan the QR code.</List.Item>
              </List.Root>
              <Text marginTop={4}>
                You can find more information or troubleshoot by following{" "}
                <Link
                  href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
                  color={color}
                  textDecoration="underline"
                  target="_blank"
                  variant="underline"
                >
                  this link
                </Link>
                .
              </Text>
            </StepsContent>
            <StepsCompletedContent
              marginLeft="auto"
              marginRight="auto"
              maxW={"2xl"}
            >
              {botType == "broadcast" ? (
                <>
                  <BroadcastConfirmation
                    color={color}
                    passcode={botPasscode}
                    phone={createdBot?.phone}
                  />
                </>
              ) : botType == "esim" ? (
                <>
                  <EsimConfirmation
                    color={color}
                    passcode={botPasscode}
                    phone={createdBot?.phone}
                  />
                </>
              ) : botType == "helpdesk" ? (
                <>
                  <HelpdeskConfirmation
                    color={color}
                    passcode={botPasscode}
                    phone={createdBot?.phone}
                  />
                </>
              ) : botType == "tipline" ? (
                <>
                  <TiplineConfirmation
                    color={color}
                    passcode={botPasscode}
                    phone={createdBot?.phone}
                  />
                </>
              ) : botType == "vpn" ? (
                <>
                  <VpnConfirmation
                    color={color}
                    passcode={botPasscode}
                    phone={createdBot?.phone}
                  />
                </>
              ) : (
                <>
                  <Text>
                    Something went wrong. Please contact a system administrator:
                    no bot type selected.
                  </Text>
                </>
              )}
            </StepsCompletedContent>
            <Container maxWidth="2xl" marginY={6} padding={0}>
              <Group>
                <StepsPrevTrigger asChild>
                  <Button
                    color={colorSteps}
                    disabled={stepCount === 0 || stepCount === 3}
                    onClick={() => {
                      // updateStepCount(-1)
                      router.push(`?step=${stepCount - 1}`);
                    }}
                    prev
                    size="sm"
                    variant="outline"
                  >
                    Prev
                  </Button>
                </StepsPrevTrigger>
                <StepsNextTrigger asChild>
                  <Button
                    color={colorSteps}
                    disabled={
                      isFetching || (stepCount === 1 && !formState.isValid)
                    }
                    onClick={(e) => {
                      if (stepCount >= 4) {
                        router.push("/my-bots");
                      }
                      if (stepCount === 2) {
                        updateStepCount(-1);
                        methods.handleSubmit(onSubmit, onError)(e);
                      }
                      if (!isFetching) {
                        // updateStepCount(1);
                      }
                      router.push(`?step=${stepCount + 1}`);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    {stepCount === 2
                      ? "Submit"
                      : stepCount >= 4
                        ? "Go to My Bots"
                        : "Next"}
                  </Button>
                </StepsNextTrigger>
                <Dialog.Root
                  lazyMount
                  open={open}
                  onOpenChange={(e) => setOpen(e.open)}
                  size="full"
                >
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.1)",
                          backdropFilter: "blur(5px)",
                        }}
                      >
                        <Dialog.Body>
                          <AbsoluteCenter>
                            <VStack>
                              <Spinner size="xl" />
                              <Text>Creating your bot...</Text>
                            </VStack>
                          </AbsoluteCenter>
                        </Dialog.Body>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </Group>
            </Container>
          </StepsRoot>
        </FormProvider>
      </Container>
    );
  }
}
