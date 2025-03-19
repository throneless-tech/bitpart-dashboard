"use client"

// base imports
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

// chakra ui imports
import {
  Button,
  Heading,
  Spinner,
  Stack,
  Text
} from "@chakra-ui/react";

// actions
import { deleteBot } from "../actions/deleteBot";
import { getUserBots } from "../actions/getUserBots";

// components imports
import BotCard from "@/app/components/botCard";

export default function BotsList({ userId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(true);
  const [bots, setBots] = useState([]);

  async function handleDelete(id) {
    setIsFetching(true);
    try {
      alert("Are you sure you want to delete this bot? This action cannot be undone.")
      await deleteBot(id);
      setIsFetching(false);
    } catch (error) {
      console.log('error: ', error);
    }

    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  }

  useEffect(() => {
    if (userId) {
      async function fetchBots() {
        const fetchedBots = await getUserBots(userId);
        setBots(fetchedBots);
        setIsFetching(false);
      }

      fetchBots();
    }
  }, [])

  useEffect(() => { }, [bots, isFetching])

  if (isFetching) {
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
                <BotCard
                  key={`${bot.botType}-${index}`}
                  bot={bot}
                  handleDelete={handleDelete}
                  userId={userId}
                />
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