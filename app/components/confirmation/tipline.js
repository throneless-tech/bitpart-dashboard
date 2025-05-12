// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

export const TiplineConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>Your tipline bot has now been created!</Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text fontWeight={700} marginTop={4}>
          What should I do now?
        </Text>
        <List.Root as="ol" lineHeight={2} marginLeft={4} marginTop={2}>
          <List.Item>
            Message your bot with the following passcode from the number you
            would like tips forwarded to (optional):{" "}
            <Text as="span" fontSize="xl">
              {props?.passcode}
            </Text>
          </List.Item>
          <List.Item>
            Test your tipline by using a different number to send a Signal
            message to your bot.
          </List.Item>
          <List.Item>
            Share your tipline widely with your target audience.
          </List.Item>
          <List.Item>
            <Text>
              Go to{" "}
              <Link color={props?.color} href="/dashboard" variant="underline">
                home
              </Link>{" "}
              to see your bots and create a new one. You will also be able to
              find the passcode there.
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Review the{" "}
              <Link
                color={props?.color}
                href="/faq"
                target="_blank"
                variant="underline"
              >
                FAQs
              </Link>{" "}
              for more information on next steps.
            </Text>
          </List.Item>
        </List.Root>
      </Box>
    </>
  );
};
