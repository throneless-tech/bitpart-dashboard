"use client";

import { useEffect, useState } from "react";

// chakra ui imports
import {
  Box,
  Button,
  Card,
  ClientOnly,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";

// components imports
import { useColorModeValue } from "@/app/components/ui/color-mode";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";
import { formatBotName, formatPhone } from "../actions/formatBot";

const botTypes = {
  broadcast: <TbBuildingBroadcastTower />,
  tipline: <LuLightbulb />,
  helpdesk: <IoHelpBuoySharp />,
  esim: <FaSimCard />,
  vpn: <CgModem />,
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
  const color = useColorModeValue("gray.600", "gray.400");

  return (
    <Card.Root width={300}>
      <Card.Body gap="2">
        {botTypes[bot.botType]}
        <Card.Title mt="2">{bot.botName}</Card.Title>
        <ClientOnly>
          <Box color={color}>
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
            <Text>{checked ? bot.passcode : "●●●●●●●●"}</Text>
          </Box>
        </ClientOnly>
      </Card.Body>
      <Card.Footer justifyContent="center">
        <Button as="a" href={`/my-bots/view/${bot.id}`} variant="outline">
          View
        </Button>
        <Button as="a" href={`/my-bots/edit/${bot.id}`} variant="outline">
          Edit
        </Button>
        <form
          action={async () => await handleDelete(bot.id, botName, username)}
        >
          <Button type="submit">Delete</Button>
        </form>
      </Card.Footer>
    </Card.Root>
  );
}
