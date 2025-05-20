"use client";

// base imports
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// form validation imports
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../lib/forms";

// chakra ui imports
import {
  AbsoluteCenter,
  Box,
  Button,
  Container,
  Dialog,
  Group,
  Heading,
  Highlight,
  HStack,
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
import { LightMode, useColorModeValue } from "@/app/components/ui/color-mode";

// form imports
import { BasicsForm } from "@/app/components/forms/basics";
import { BroadcastForm } from "@/app/components/forms/broadcast";
import { EsimForm } from "@/app/components/forms/esim";
import { HelpdeskForm } from "@/app/components/forms/helpdesk";
import { Summary } from "@/app/components/forms/summary";
import { TiplineForm } from "@/app/components/forms/tipline";
import { VpnForm } from "@/app/components/forms/vpn";

// confirmation pages
import { BroadcastConfirmation } from "./confirmation/broadcast";
import { EsimConfirmation } from "./confirmation/esim";
import { HelpdeskConfirmation } from "./confirmation/helpdesk";
import { TiplineConfirmation } from "./confirmation/tipline";
import { VpnConfirmation } from "./confirmation/vpn";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";

// actions
import { updateBotBitpart, updateBotPrisma } from "@/app/actions/updateBot";
import { formatBotName } from "@/app/actions/formatBot";
import { parseCSV } from "@/app/actions/csv";
import { getBot } from "@/app/actions/getUserBots";

// constants
import { MAX_BOTS } from "@/app/constants";

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
  "storageTime",
  "vpnName",
];

export default function EditBotFlow({ botId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [createdBot, setCreatedBot] = useState(null);
  const [stepCount, setStepCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [botPasscode, setBotPasscode] = useState("");
  const [qrLink, setQRLink] = useState("");
  const [bot, setBot] = useState(null);

  async function fetchBot() {
    const fetchedBot = await getBot(botId);
    setBot(fetchedBot);
    setIsFetching(false);
  }

  useEffect(() => {
    if (botId) {
      fetchBot();
    }
  }, []);

  useEffect(() => {}, [bot, isFetching]);

  const methods = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const values = methods.getValues();

  const watchAll = methods.watch();

  const formState = methods.formState;

  // submit bot creation for bitpart server and prisma db
  const onSubmit = async (data) => {
    setIsFetching(true);
    setOpen(true);

    try {
      // format bot id for bitpart
      const botBitpart = await updateBotBitpart(
        data,
        bot.bitpartId,
        bot.passcode,
      );

      if (botBitpart?.message_type === "Error") {
        throw new Error(botBitpart.data.response);
      }

      let emsData;
      if ((data.botType === "esim" || data.botType === "vpn") && data.csv) {
        emsData = await parseCSV(
          botBitpart.data.response.bot.id,
          data.botType,
          data.csv,
        );
      }

      if (emsData?.error) {
        throw new Error(emsData.error.message);
      }

      const updatedBot = await updateBotPrisma(
        data,
        bot.id,
        bot.bitpartId,
        bot.passcode,
      );
    } catch (error) {
      console.log(error);
      alert(
        "A server error occurred while trying to update this bot. Please contact an admin for assistance.",
      );
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
  const color = useColorModeValue("maroon", "yellow");

  useEffect(() => {}, [createdBot, isFetching, stepCount, watchAll]);

  if (notAllowed) {
    return (
      <Box>
        <Container marginTop={8} maxWidth="lg">
          <Text>
            You have reached the limit on how many bots a user may create.
            Please{" "}
            <Link color={color} href="/home" variant="underline">
              return home
            </Link>{" "}
            and delete a bot if you would like to create a new one.
          </Text>
        </Container>
      </Box>
    );
  } else {
    return (
      <Container marginBottom={6} maxW="3xl">
        <Heading as="h1" marginBottom={4} size="xl">
          Edit{` ${bot?.botName}`}
        </Heading>
        <FormProvider {...methods}>
          <BasicsForm bot={bot} />
          <Heading as="h2" marginBottom={4} size="md">
            Bot specifics
          </Heading>
          {bot?.botType == "broadcast" ? (
            <>
              <Text fontSize="sm" marginBottom={8}>
                Anyone who has signed up to receive messages from your bot will
                be able to request to see a menu, which offers them the option
                to learn about the bot. Fill out these sections below to
                customize the text.
              </Text>
              <BroadcastForm bot={bot} />
            </>
          ) : bot?.botType == "esim" ? (
            <>
              <Text fontSize="sm" marginBottom={8}>
                Anyone who has started a conversation with your bot will be able
                to request to see a menu, which offers them the option to learn
                about the bot. Fill out these sections below to customize the
                text.
              </Text>
              <EsimForm bot={bot} />
            </>
          ) : bot?.botType == "helpdesk" ? (
            <>
              <Text fontSize="sm" marginBottom={8}>
                Anyone who has started a conversation with your bot will be able
                to request to see a menu, which offers them the option to learn
                about the bot. Fill out these sections below to customize the
                text.
              </Text>
              <HelpdeskForm bot={bot} />
            </>
          ) : bot?.botType == "tipline" ? (
            <>
              <Text fontSize="sm" marginBottom={8}>
                Anyone who has started a conversation with your bot will be able
                to request to see a menu, which offers them the option to learn
                about the bot. Fill out these sections below to customize the
                text.
              </Text>
              <TiplineForm bot={bot} />
            </>
          ) : bot?.botType == "vpn" ? (
            <>
              <Text fontSize="sm" marginBottom={8}>
                Anyone who has started a conversation with your bot will be able
                to request to see a menu, which offers them the option to learn
                about the bot. Fill out these sections below to customize the
                text.
              </Text>
              <VpnForm bot={bot} />
            </>
          ) : (
            <>
              <Text>
                Something went wrong. Please contact a system administrator: no
                bot type selected.
              </Text>
            </>
          )}
          <HStack gap={4} marginTop={8}>
            <Button as="a" href="/home" size="sm" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isFetching}
              onClick={(e) => {
                methods.setValue("botType", bot.botType, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                methods.handleSubmit(onSubmit, onError)(e);
              }}
              size="sm"
            >
              Submit
            </Button>
          </HStack>
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
        </FormProvider>
      </Container>
    );
  }
}
