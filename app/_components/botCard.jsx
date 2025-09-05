"use client";

import { useEffect, useState } from "react";

// chakra ui imports
import { Box, Card, ClientOnly, Stack, Switch, Text } from "@chakra-ui/react";

// components imports
import { Button } from "@/app/_components/ui/button";
import { useColorModeValue } from "@/app/_components/ui/color-mode";

// icons imports
import Bullhorn from "@/app/_icons/bullhorn";
import Chart from "@/app/_icons/chart";
import Helpdesk from "@/app/_icons/helpdesk";
import Lightbulb from "@/app/_icons/lightbulb";
import Phone from "@/app/_icons/phone";

// actions
import { formatBotName, formatPhone } from "../_actions/formatBot";

// fonts
import { geistMono } from "@/app/fonts";

const botTypes = {
  broadcast: <Bullhorn />,
  tipline: <Lightbulb />,
  helpdesk: <Helpdesk />,
  esim: <Phone />,
  vpn: <Chart />,
};

export default function BotCard(props) {
  const { bot, handleDelete, username } = props;
  const [checked, setChecked] = useState(false);
  const [botName, setBotName] = useState("");
  const [botPhone, setBotPhone] = useState("");

  if (!bot) return null;

  const getFormattedBotName = async (botName) => {
    const name = await formatBotName(bot.botName);
    setBotName(name);
  };

  const getFormattedPhone = async (botPhone, countryCode) => {
    const phone = await formatPhone(botPhone, countryCode);
    setBotPhone(phone);
  };

  useEffect(() => {
    if (bot?.name) {
      getFormattedBotName(bot.name);
    }

    if (bot?.phone) {
      getFormattedPhone(bot.phone, bot.countryCode);
    }
  });

  useEffect(() => {}, [bot, botName, botPhone]);

  // color mode
  const color = useColorModeValue("black", "white");
  const colorSubmit = useColorModeValue("white", "black");

  return (
    <Card.Root width={400}>
      <Card.Body gap="2">
        <Box fill={color} width={6}>
          {botTypes[bot.botType]}
        </Box>
        <Card.Title className={geistMono.className} mt="2">
          {bot.botName}
        </Card.Title>
        <ClientOnly>
          <Box>
            {botPhone ? <Text>{botPhone}</Text> : null}
            <Stack alignItems="flex-start" direction="row" marginTop={2}>
              <Text>View passcode </Text>
              <Switch.Root
                checked={checked}
                onCheckedChange={(e) => setChecked(e.checked)}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label />
              </Switch.Root>
            </Stack>
            <Text className={geistMono.className}>
              {checked ? bot.passcode : "●●●●●●●●"}
            </Text>
          </Box>
        </ClientOnly>
      </Card.Body>
      <Card.Footer justifyContent="center">
        <Button
          as="a"
          color={color}
          href={`/my-bots/view/${bot.id}`}
          variant="outline"
        >
          View
        </Button>
        <Button
          as="a"
          color={color}
          href={`/my-bots/edit/${bot.id}`}
          variant="outline"
        >
          Edit
        </Button>
        <form
          action={async () =>
            await handleDelete(bot.id, bot.bitpartId, username, bot.instance)
          }
        >
          <Button color={colorSubmit} type="submit" variant="solid">
            Delete
          </Button>
        </form>
      </Card.Footer>
    </Card.Root>
  );
}
