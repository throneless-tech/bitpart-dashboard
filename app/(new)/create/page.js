// base imports
import { auth } from "@/auth";

// chakra ui imports
import { Box } from "@chakra-ui/react";

// component imports
import CreateBotFlow from '@/app/components/create';
import Header from "@/app/ui/header";


export default async function Create() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>
  
  return (
    <Box>
      <Header />
      <CreateBotFlow userId={session.id} />
    </Box>
  );
}
