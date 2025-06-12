// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

export const BroadcastConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>Your broadcast channel has now been created!</Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text fontWeight={700} marginTop={4}>
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
            Test your channel by using a different number to send a Signal
            message to your channel.
          </List.Item>
          <List.Item>
            Share your channel widely with your target audience.
          </List.Item>
          <List.Item>
            <Text marginTop={4}>
              Go{" "}
              <Link color={props?.color} href="/home" variant="underline">
                home
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
