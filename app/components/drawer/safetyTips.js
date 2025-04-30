// base imports
import React from "react";

// chakra imports
import { Link, List, Text } from "@chakra-ui/react";

export default function SafetyTipsText() {
  return (
    <>
      <Text>
        Here, you might want to encourage best digital safety practices that are
        best for your situation, context, and audience.
      </Text>
      <Text marginTop={4}>
        For instance, you might want to remind people that they can set a short
        disappearing message timer in Signal on the messages from this
        conversation, and direct them to how to do it:{" "}
        <Link
          href="https://support.signal.org/hc/en-us/articles/360007320771-Set-and-manage-disappearing-messages"
          variant="underline"
        >
          https://support.signal.org/hc/en-us/articles/360007320771-Set-and-manage-disappearing-messages
        </Link>{" "}
        Or, that they can use a pseudonym as their profile name on Signal.
      </Text>
      <Text marginTop={4}>
        If you are planning an upcoming action, you may want to remind people to
        leave their phone at home if possible. If they must bring their phone,
        to delete photos you do not want others to see, delete messages and
        chats; delete apps; and set disappearing message times to 1 hour.
      </Text>
    </>
  );
}
