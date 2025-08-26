"use client";

// base imports
import { useCallback, useEffect, useState } from "react";

// chakra ui imports
import { Box, Button, Heading, Spinner, Stack, Text } from "@chakra-ui/react";

// actions
import { deleteBot } from "@/app/_actions/deleteBot";
import { getUserBots } from "@/app/_actions/getUserBots";

// components imports
import BotCard from "@/app/_components/botCard";
import PrivacyConsent from "@/app/_components/privacyConsent";

// constants
import { MAX_BOTS } from "@/app/constants";

export default function BotsList({ username }) {
  const [isFetching, setIsFetching] = useState(true);
  const [bots, setBots] = useState([]);
  const [consentAgree, setConsentAgree] = useState(false);

  const fetchBots = useCallback(async () => {
    try {
      const fetched = await getUserBots(username);
      console.log(fetched);

      setBots(fetched.bots);
      setConsentAgree(fetched.user.consent_agree);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsFetching(false);
    }
  });

  useEffect(() => {
    fetchBots();
  }, []);

  async function handleDelete(id, phone, username) {
    setIsFetching(true);
    try {
      alert(
        "Are you sure you want to delete this bot? This action cannot be undone.",
      );
      await deleteBot(id, phone, username);
      await fetchBots();
      setIsFetching(false);
    } catch (error) {
      console.log("error: ", error);
    }
  }

  useEffect(() => {
    if (username) {
      fetchBots(username);
    }
  }, []);

  useEffect(() => {}, [bots, consentAgree, isFetching]);

  if (isFetching) {
    return <Spinner size="lg" />;
  } else {
    return (
      <>
        {!consentAgree ? (
          <Box>
            <PrivacyConsent
              username={username}
              setConsentAgree={setConsentAgree}
            />
          </Box>
        ) : bots && bots.length ? (
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
                  username={username}
                />
              ))}
            </Stack>
            <Text fontStyle="italic" marginTop={8}>
              Tip: You can send the word "Admin" to your bot at any time to
              enter the passcode and view your bot as an administrator in
              Signal.
            </Text>
          </>
        ) : (
          <Text>You do not have any bots. Click below to create one.</Text>
        )}
        <Button
          as="a"
          disabled={bots?.consent_agree === false || (bots && bots.length > 3)}
          href="/create"
          onClick={(e) => {
            if (bots?.consent_agree === false || (bots && bots.length > 3)) {
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
