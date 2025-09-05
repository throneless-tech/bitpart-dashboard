// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

// fonts
import { geistMono } from "@/app/fonts";

export const BroadcastConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>Your broadcast channel has now been created!</Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text className={geistMono.className} fontWeight={700} marginTop={4}>
          What should I do now?
        </Text>
        <List.Root as="ol" marginLeft={4} marginTop={2}>
          <List.Item>
            Message your bot with the following passcode to establish you as a
            broadcaster:{" "}
            <Text as="span" fontSize="xl">
              {props?.passcode}
            </Text>
          </List.Item>
          <List.Item>
            Message your bot with the word "Admin" at any time to enter your
            passcode.
          </List.Item>
          <List.Item>
            Test your bot by using a different number to send a Signal message
            to your bot.
          </List.Item>
          <List.Item>
            Share your bot's Signal contact information with your target
            audience.
          </List.Item>
          <List.Item>
            <Text>
              Go to{" "}
              <Link color={props?.color} href="/my-bots" variant="underline">
                My Bots
              </Link>{" "}
              to see your bots and create a new one. You will also be able to
              find the passcode there.
            </Text>
          </List.Item>
        </List.Root>
      </Box>
    </>
  );
};
