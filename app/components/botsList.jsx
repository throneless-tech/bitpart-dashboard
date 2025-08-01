"use client";

// base imports
import { useCallback, useEffect, useState } from "react";

// chakra ui imports
import { Button, Heading, Spinner, Stack, Text } from "@chakra-ui/react";

// actions
import { deleteBot } from "../actions/deleteBot";
import { getUserBots } from "../actions/getUserBots";

// components imports
import BotCard from "@/app/components/botCard";

// constants
import { MAX_BOTS } from "../constants";

export default function BotsList({ authed }) {
  const [isFetching, setIsFetching] = useState(true);
  const [bots, setBots] = useState([]);

  const fetchBots = useCallback(async () => {
    const fetchedBots = await getUserBots();
    setBots(fetchedBots);
    setIsFetching(false);
  });

  useEffect(() => {
    fetchBots();
  }, []);

  async function handleDelete(id, phone) {
    setIsFetching(true);
    try {
      alert(
        "Are you sure you want to delete this bot? This action cannot be undone.",
      );
      await deleteBot(id, phone);
      await fetchBots();
      setIsFetching(false);
    } catch (error) {
      console.log("error: ", error);
    }
  }

  useEffect(() => {
    if (authed) {
      fetchBots();
    }
  }, []);

  useEffect(() => {}, [bots, isFetching]);

  if (isFetching) {
    return <Spinner size="lg" />;
  } else {
    return (
      <>
        {bots && bots.length ? (
          <>
            <Heading as="h2" size="xl">
              My bots
            </Heading>
            <Stack
              direction={["column", "column", "row"]}
              wrap={"wrap"}
              gap={[4, 4, 8]}
              marginTop={4}
            >
              {bots.map((bot, index) => (
                <BotCard
                  key={`${bot.botType}-${index}`}
                  bot={bot}
                  handleDelete={handleDelete}
                />
              ))}
            </Stack>
          </>
        ) : (
          <Text>You do not have any bots. Click below to create one.</Text>
        )}
        <Button
          as="a"
          disabled={bots && bots.length > 3}
          href="/create"
          onClick={(e) => {
            if (bots && bots.length > 3) {
              e.preventDefault();
            }
          }}
          marginTop={10}
        >
          Create a new bot
        </Button>
        {bots && bots.length >= MAX_BOTS ? (
          <Text fontSize="sm" marginTop={2} style={{ fontStyle: "italic" }}>
            You have reached the limit on how many bots a user may create.
            Please delete a bot if you would like to create a new one.
          </Text>
        ) : null}
      </>
    );
  }
}
