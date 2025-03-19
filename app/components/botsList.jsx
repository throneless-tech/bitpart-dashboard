"use client"

import { useEffect, useState } from "react";

// chakra ui imports
import {
  Button,
  Heading,
  Spinner,
  Stack,
  Text
} from "@chakra-ui/react";

// actions
import { getUserBots } from "../actions/getUserBots";

// components imports
import BotCard from "@/app/components/botCard";

export default function BotsList({ userId }) {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      async function fetchBots() {
        const fetchedBots = await getUserBots(userId);
        setBots(fetchedBots);
        setLoading(false);
      }

      fetchBots();
    }
  }, [])

  useEffect(() => { }, [bots, loading])

  if (loading) {
    return <Spinner size="lg" />
  } else {
    return (
      <>
        {bots && bots.length ? (
          <>
            <Heading as='h2' size="xl">
              My bots
            </Heading>
            <Stack
              direction={["column", "column", "row"]}
              wrap={"wrap"}
              gap={[4, 4, 8]}
              marginTop={4}
            >
              {bots && bots.length && bots.map((bot, index) => (
                <BotCard key={`${bot.botType}-${index}`} bot={bot} userId={userId} />
              ))}
            </Stack>
          </>
        ) : (
          <Text>You do not have any bots. Click below to create one.</Text>
        )}
        <Button
          as='a'
          disabled={bots && bots.length > 3}
          href='/create'
          onClick={(e) => {
            if (bots && bots.length > 3) {
              e.preventDefault();
            }
          }}
          marginTop={10}
        >
          Create a new bot
        </Button>
      </>
    )
  }
}