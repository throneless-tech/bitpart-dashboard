"use client";

// base imports
import { useEffect, useState } from "react";

// chakra ui imports
import { Button, Spinner, Stack, Text } from "@chakra-ui/react";

// actions
import { deleteBot } from "../actions/deleteBot";
import { getUserSessions } from "../actions/getUserSessions";

export default function SessionsList({ userId }) {
  // const [isFetching, setIsFetching] = useState(true);
  const [sessions, setSessions] = useState([]);

  async function fetchSessions() {
    const fetched = await getUserSessions(userId);
    setSessions(fetched);
    setIsFetching(false);
  }

  // async function handleDelete(id, phone) {
  //     setIsFetching(true);
  //     try {
  //         alert(
  //             "Are you sure you want to delete this bot? This action cannot be undone.",
  //         );
  //         await deleteBot(id, phone);
  //         await fetchSessions();
  //         setIsFetching(false);
  //     } catch (error) {
  //         console.log("error: ", error);
  //     }
  // }

  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, []);

  useEffect(() => {
    console.log("SESSIONS ****", sessions);
  }, [sessions]);

  return <>hello</>;

  // if (isFetching) {
  //     return <Spinner size="lg" />;
  // } else {
  //     return (
  //         <>
  //             {sessions && sessions.length ? (
  //                 <>
  //                     <Stack
  //                         direction={["column", "column", "row"]}
  //                         wrap={"wrap"}
  //                         gap={[4, 4, 8]}
  //                         marginTop={4}
  //                     >
  //                         {/* {sessions &&
  //                             sessions.length &&
  //                             sessions.map((session, index) => (
  //                                 <BotCard
  //                                     key={`${bot.botType}-${index}`}
  //                                     bot={bot}
  //                                     handleDelete={handleDelete}
  //                                     userId={userId}
  //                                 />
  //                             ))} */}
  //                     </Stack>
  //                 </>
  //             ) : (
  //                 <Text>You do not have any sessions. Click below to create one.</Text>
  //             )}
  //             <Button
  //                 as="a"
  //                 disabled={sessions && sessions.length > 3}
  //                 href="/create"
  //                 onClick={(e) => {
  //                     if (sessions && sessions.length > 3) {
  //                         e.preventDefault();
  //                     }
  //                 }}
  //                 marginTop={10}
  //             >
  //                 Create a new bot
  //             </Button>
  //             {sessions && sessions.length >= MAX_sessions ? (
  //                 <Text fontSize="sm" marginTop={2} style={{ fontStyle: "italic" }}>
  //                     You have reached the limit on how many sessions a user may create.
  //                     Please delete a bot if you would like to create a new one.
  //                 </Text>
  //             ) : null}
  //         </>
  //     );
  // }
}
