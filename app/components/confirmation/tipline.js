// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

export const TiplineConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>Your tipline bot has now been created!</Text>
      <Text fontWeight={700} marginTop={4}>
        You will be able to see all tips on the device which uses the Signal
        account that your bot is linked to.
      </Text>
      <Text marginTop={4}>
        Bitpart can also forward tips to another Signal account, which can help
        identify tips. We recommend not using your personal one due to the
        potential sensitivity of tips. Try to use a new phone number and Signal
        account.
      </Text>
      <Text marginTop={4}>
        To set up forwarding, please Signal message the following passcode to
        the bot {`${props?.phone} `} from the account on which you'd like to
        receive the tips:
      </Text>
      <Text marginTop={4}>
        Your passcode is{" "}
        <Text as="span" fontSize="xl">
          {props?.passcode}
        </Text>
      </Text>
      <Text marginTop={4}>
        If you want to stop receiving forwarded tips, sending "Delete" to your
        bot will erase the conversation and thus Bitpart's memory of you sending
        the passcode.
      </Text>
      <Text marginTop={4}>
        You will be able to find the passcode again later in your dashboard on
        this website.
      </Text>
      <Text marginTop={4}>
        Teammates can also receive forwarded messages requiring human support.
        They can do this in 2 ways:
      </Text>
      <Text marginTop={4}>
        Either 1. Using the passcode: They should open Signal on their device
        and send the same passcode to your tipline bot.
      </Text>
      <Text marginTop={4}>
        Or 2. Linking devices: Link a desktop or iPad version of Signal to the
        Signal account you are using for receiving the forwarded messages.
        Here's guidance on how to do this:{" "}
        <Link
          color={props?.color}
          href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
        >
          support.signal.org/hc/en-us/articles/360007320551-Linked-Devices
        </Link>
      </Text>
      <Text marginTop={4}>
        Remember -- the passcode gives someone access to receive messages from
        people using your bot. Please keep it safe.
      </Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text fontWeight={700} marginTop={4}>
          What should I do now?
        </Text>
        <List.Root as="ol" marginLeft={4} marginTop={2}>
          <List.Item>
            Message your bot with the passcode from the number you would like
            tips forwarded to (optional)
          </List.Item>
          <List.Item>
            Test your tipline by using a different number to send a Signal
            message to your bot.
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
