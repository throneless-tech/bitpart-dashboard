"use client";

// base imports
import { useCallback, useEffect, useState } from "react";

// chakra ui imports
import {
  Box,
  Container,
  Link,
  List,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

// actions imports
import { getBot } from "@/app/_actions/getUserBots";

// components imports
import { Alert } from "@/app/_components/ui/alert";
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// icon imports
import Edit from "@/app/_icons/edit";

export const Summary = ({ data, errors, botId, username }) => {
  const [bot, setBot] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  const fetchBot = useCallback(async () => {
    try {
      const fetchedBot = await getBot(botId, username);

      if (!fetchedBot) {
        setNotAllowed(true);
      }

      setBot(fetchedBot);
    } catch (error) {
      setNotAllowed(true);
    } finally {
      setIsFetching(false);
    }
  });

  useEffect(() => {
    if (botId && username) {
      fetchBot();
    } else {
      setBot(data);
      setIsFetching(false);
    }
  }, [data]);

  // color mode
  const color = useColorModeValue("purple.600", "purple.400");
  const colorEdit = useColorModeValue("black", "white");
  const colorDone = useColorModeValue("white", "black");

  useEffect(() => {}, [bot, isFetching, notAllowed]);

  if (isFetching) {
    return <Spinner />;
  }
  if (notAllowed) {
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
      <>
        {botId ? (
          <Stack
            alignItems={["flex-start", "center", "center"]}
            direction={["column", "row"]}
            justifyContent="space-between"
          >
            <Text>Here is your bot summary:</Text>
            <Stack direction="row">
              <Button
                as="a"
                color={colorEdit}
                href={`/my-bots/edit/${botId}`}
                variant="outline"
              >
                <Text as="span">Edit</Text>
              </Button>
              <Button
                as="a"
                color={colorDone}
                href={`/my-bots`}
                variant="solid"
              >
                Done
              </Button>
            </Stack>
          </Stack>
        ) : null}
        {errors && Object.keys(errors).length !== 0 ? (
          <>
            <Box marginY={6}>
              <Alert status="error" title="Invalid Fields">
                <Text>
                  Your form has some errors. Please go back and fix the
                  following fields before submitting this form:
                </Text>
                <List.Root marginTop={2} variant="plain">
                  {Object.keys(errors).map((key) => (
                    <List.Item key={key}>{key}</List.Item>
                  ))}
                </List.Root>
              </Alert>
            </Box>
          </>
        ) : null}
        {bot && Object.keys(bot).length != 0
          ? Object.keys(bot).map((key) => (
              <Text as="div" key={key} marginTop={4}>
                <Text fontWeight="bold">
                  {bot[key] && bot[key].length
                    ? key === "botType"
                      ? "Bot type"
                      : key === "botName"
                        ? "Bot name"
                        : key === "adminPhones"
                          ? "Admin phones"
                          : key === "privacyPolicy"
                            ? "Data rights"
                            : key === "safetyTips"
                              ? "Safety tips"
                              : key === "activationInstructions"
                                ? "Activation instructions"
                                : key === "helpInstructions"
                                  ? "Help instructions"
                                  : key === "storageAccess"
                                    ? "Storage access"
                                    : key === "responseTime"
                                      ? "Response time"
                                      : key === "maxCodes"
                                        ? "Maximum number of codes per user"
                                        : key === "vpnName"
                                          ? "VPN name"
                                          : key === "csv"
                                            ? "List of codes"
                                            : key === "locations"
                                              ? "Network/Provider"
                                              : key === "description"
                                                ? "About"
                                                : key === "bitpartId" ||
                                                    key === "countryCode" ||
                                                    key === "createdAt" ||
                                                    key === "creatorId" ||
                                                    key === "id" ||
                                                    key === "updatedAt"
                                                  ? ""
                                                  : `${key.charAt(0).toUpperCase()}${key.slice(1)}`
                    : null}
                </Text>
                {!!bot[key] &&
                typeof bot[key] !== "string" &&
                bot[key].length &&
                key !== "csv" ? (
                  bot[key].map((d, ind) => (
                    <Box key={`innerdata-${ind}`}>
                      {Object.keys(d).map((k, i) => (
                        <Box key={`${k}-${i}`}>
                          {/* <Text fontWeight="bold">{`${k.charAt(0).toUpperCase()}${k.slice(1)}`}</Text> */}
                          <Text>{d[k]}</Text>
                        </Box>
                      ))}
                    </Box>
                  ))
                ) : bot[key] && key === "csv" ? (
                  Array.from(bot[key]).map((f, i) => (
                    <Box key={`csv-${i}`}>(Uploaded)</Box>
                  ))
                ) : (
                  <Text>
                    {key === "phone" && bot[key] && bot[key].length
                      ? `+${bot["countryCode"]} ${bot[key]}`
                      : key === "bitpartId" ||
                          key === "countryCode" ||
                          key === "createdAt" ||
                          key === "creatorId" ||
                          key === "id" ||
                          key === "updatedAt"
                        ? ""
                        : bot[key]}
                  </Text>
                )}
              </Text>
            ))
          : null}
      </>
    );
  }
};
