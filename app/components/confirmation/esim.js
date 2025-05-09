// base imports
import React from "react";

// chakra ui imports
import { Box, Link, List, Text } from "@chakra-ui/react";

export const EsimConfirmation = (props) => {
  return (
    <>
      <Text marginTop={12}>
        Your eSIM distribution bot has now been created!
      </Text>
      <Text marginTop={4}>
        It's important that people are able to reach you if they get stuck. You
        will be able to see all messages and conversations through the Signal
        account you have used for the eSIM bot. You can also set up Bitpart to
        forward on the conversations needing additional support to another
        number, to help identify these.
      </Text>
      <Text marginTop={4}>
        Keep in mind that this Signal account will then have to directly send
        messages to the end user. The account's public username will be visible
        to the end user.
      </Text>
      <Text marginTop={4}>
        To set up forwarding of requests for human support, please send a Signal
        message to your eSIM bot {`${props?.phone} `}with the following
        passcode:
      </Text>
      <Text marginTop={4}>
        Your passcode is{" "}
        <Text as="span" fontSize="xl">
          {props?.passcode}
        </Text>
      </Text>
      <Text marginTop={4}>
        Due to the potential volume of messages requesting human support, we
        recommend not using your personal number. Try to use a new phone number
        and dedicated Signal account.
      </Text>
      <Text marginTop={4}>
        If you want to remove a number in future, entering "Delete" will erase
        the conversation and thus Bitpart's memory of you sending the passcode.
      </Text>
      <Text marginTop={4}>
        Teammates can also receive forwarded messages requiring human support.
        They can do this in 2 ways:
      </Text>
      <Text marginTop={4}>
        Either 1. Using the passcode: They should open Signal on their device
        and send the same passcode to your eSIM bot.
      </Text>
      <Text marginTop={4}>
        Or 2. Linking devices: Link a desktop or iPad version of Signal to the
        Signal account you are using for the forwarded human support messages.
        Here's guidance on how to do this:{" "}
        <Link
          color={props?.color}
          href="https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices"
          target="_blank"
        >
          support.signal.org/hc/en-us/articles/360007320551-Linked-Devices
        </Link>
      </Text>
      <Text marginTop={4}>
        Remember -- this passcode gives someone access to receive messages from
        people using your bot. Please keep it safe.
      </Text>
      <Box border={`1px solid ${props?.color}`} margin={4} padding={4}>
        <Text fontWeight={700} marginTop={4}>
          What should I do now?
        </Text>
        <List.Root as="ol" marginLeft={4} marginTop={2}>
          <List.Item>
            Message your bot the passcode from a Signal account you'd like to
            use to provide human support.
          </List.Item>
          <List.Item>
            Test your eSIM distribution bot by using a different number to send
            a Signal message to your channel.
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
