"use client";

// base imports
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// form validation imports
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../_lib/forms";

// chakra ui imports
import {
  AbsoluteCenter,
  Box,
  Center,
  Container,
  Dialog,
  Heading,
  HStack,
  Link,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

// component imports
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// form imports
import { BasicsForm } from "@/app/_components/forms/basics";
import { BroadcastForm } from "@/app/_components/forms/broadcast";
import { EsimForm } from "@/app/_components/forms/esim";
import { HelpdeskForm } from "@/app/_components/forms/helpdesk";
import { TiplineForm } from "@/app/_components/forms/tipline";
import { VpnForm } from "@/app/_components/forms/vpn";

// actions
import {
  updateBot,
  updateBotBitpart,
  updateBotPrisma,
} from "@/app/_actions/updateBot";
import { parseCSV } from "@/app/_actions/csv";
import { getBot } from "@/app/_actions/getUserBots";

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

export default function EditBotFlow({ botId, username }) {
  const router = useRouter();
  const [notAllowed, setNotAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [botPasscode, setBotPasscode] = useState("");
  const [bot, setBot] = useState(null);

  const methods = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });

  const values = methods.getValues();

  const watchAll = methods.watch();

  const formState = methods.formState;

  const fetchBot = useCallback(async () => {
    try {
      const fetchedBot = await getBot(botId, username);

      if (!fetchedBot) {
        setNotAllowed(true);
      }

      setBot(fetchedBot);
      methods.reset(fetchedBot);
      methods.clearErrors();
      methods.unregister(valuesToUnregister, { keepDefaultValue: true });
    } catch (error) {
      setNotAllowed(true);
    } finally {
      setIsFetching(false);
    }
  }, [methods.reset]);

  useEffect(() => {
    fetchBot();
  }, [fetchBot]);

  // submit bot creation for bitpart server and prisma db
  const onSubmit = async (data) => {
    setIsFetching(true);
    setOpen(true);

    try {
      // format bot id for bitpart
      const updatedBot = await updateBot(
        data,
        bot.id,
        bot.bitpartId,
        username,
        bot.passcode,
        bot.instance,
      );

      router.push(`/my-bots/view/${bot.id}`);
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
  const color = useColorModeValue("purple.600", "purple.400");
  const colorCancel = useColorModeValue("black", "white");
  const colorSubmit = useColorModeValue("white", "black");

  useEffect(() => {}, [isFetching, notAllowed, watchAll]);

  if (isFetching) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  } else if (notAllowed) {
    return (
      <Box>
        <Container marginTop={8} maxWidth="lg">
          <Text>You do not have access rights to view or edit this bot.</Text>
          <Text marginTop={4}>
            You can{" "}
            <Link color={color} href="/my-bots" variant="underline">
              return to My Bots
            </Link>
            .
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
            <Spinner size="xl" />
          )}
          <HStack gap={4} marginTop={8}>
            <Button
              as="a"
              color={colorCancel}
              href="/my-bots"
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              color={colorSubmit}
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
                        <Text>Updating your bot...</Text>
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
