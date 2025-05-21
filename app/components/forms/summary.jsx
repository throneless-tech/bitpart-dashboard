"use client";

// base imports
import { useCallback, useEffect, useState } from "react";

// chakra ui imports
import { Box, List, Text } from "@chakra-ui/react";

// actions imports
import { getBot } from "@/app/actions/getUserBots";

// components imports
import { Alert } from "@/app/components/ui/alert";

export const Summary = ({ data, errors, botId }) => {
  const [bot, setBot] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBot = useCallback(async () => {
    const fetchedBot = await getBot(botId);
    setBot(fetchedBot);
    setIsFetching(false);
  });

  useEffect(() => {
    if (botId) {
      fetchBot();
    } else {
      setBot(data);
    }
  }, [data]);

  useEffect(() => {}, [bot]);

  return (
    <>
      {errors && Object.keys(errors).length !== 0 ? (
        <>
          <Box marginY={6}>
            <Alert status="error" title="Invalid Fields">
              <Text>
                Your form has some errors. Please go back and fix the following
                fields before submitting this form:
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
};
