"use client"

// chakra ui imports
import { Button, Card } from "@chakra-ui/react";

// icons imports
import { CgModem } from "react-icons/cg";
import { FaSimCard } from "react-icons/fa";
import { IoHelpBuoySharp } from "react-icons/io5";
import { LuLightbulb } from "react-icons/lu";
import { TbBuildingBroadcastTower } from "react-icons/tb";

// actions
import { deleteBot } from "../actions/deleteBot";
import { getUserBots } from "../actions/getUserBots";

const botTypes =
{
  broadcast: <TbBuildingBroadcastTower />,
  tipline: <LuLightbulb />,
  helpdesk: <IoHelpBuoySharp />,
  esim: <FaSimCard />,
  vpn: <CgModem />,
};

export default function BotCard(props) {
  const { bot, userId } = props;

  if (!bot) return null;

  return (
    <Card.Root>
      <Card.Body gap="2">
        {botTypes[bot.botType]}
        <Card.Title mt="2">{bot.botName}</Card.Title>
        <Card.Description>
          {bot.phone}
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        {/* <Button variant="outline">View</Button> */}
        <form action={async () => {
          try {
            alert("Are you sure you want to delete this bot? This action cannot be undone.")
            await deleteBot(bot.id);
            getUserBots(userId);
          } catch (error) {
            console.log('error: ', error);
          }
          
        }}>
          <Button type="submit">Delete</Button>
        </form>
      </Card.Footer>
    </Card.Root>
  )
}