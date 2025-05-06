// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

export const BroadcastConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>Your broadcast channel has now been created!</Text>
      <Text fontWeight={700} marginTop={4}>
        How can I start sending messages?
      </Text>
      <Text marginTop={4}>
        For the system to recognise you as the person sending broadcast messages
        (and not as someone joining the broadcast channel) please text the below
        passcode to your channel {`${props?.phone} `} via Signal.
      </Text>
      <Text marginTop={4}>
        Your passcode is{" "}
        <Text as="span" fontSize="xl">
          {props?.passcode}
        </Text>
      </Text>
      <Text marginTop={4}>
        You only need to send it once. Bitpart will recognise you going
        forwards. After you send the passcode, Bitpart will give you options
        available to you, including sending a message to broadcast to your
        channel.
      </Text>
      <Text marginTop={4}>
        If you want to change or remove your number, sending "Delete" will erase
        the conversation and thus Bitpart's memory of you as someone who is able
        to send broadcast messages.
      </Text>
      <Text marginTop={4}>
        More than one person can send broadcast messages. If another person
        sends the passcode over Signal from their own account to the bot's
        channel, they will be able to send out broadcast messages too.
      </Text>
      <Text marginTop={4}>
        You will be able to find the passcode again later in your dashboard.
        Keep your passcode secure. Remember -- this passcode gives any access to
        broadcast messages to the entire list.
      </Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text fontWeight={700} marginTop={4}>
          What should I do now?
        </Text>
        <List.Root as="ol" marginLeft={4} marginTop={2}>
          <List.Item>
            Message your bot with the passcode to establish you as a
            broadcaster.
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
              Go to{" "}
              <Link color={props?.color} href="/dashboard" variant="underline">
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
