// base imports
import React from "react";

// chakra imports
import { Link, List, Text } from "@chakra-ui/react";

export default function TiplineMyDataText() {
  return (
    <>
      <Text>This tipline does not ask you for any personal data.</Text>
      <Text marginTop={4}>
        The tips you share is recorded & stored [WHERE?]
      </Text>
      <Text marginTop={4}>
        Personal data attached to your tip is any information that is visible on
        your Signal profile (e.g. your profile name, your phone number if you
        choose to share or username if visible). Remember, you can adjust your
        Signal profile settings to give you more anonymity.
      </Text>
      <Text marginTop={4}>We delete tips every [TIMEFRAME?]</Text>
      <Text marginTop={4}>
        If you would like your data deleted from our systems, please contact
        [ADD CONTACT METHOD].
      </Text>
    </>
  );
}
