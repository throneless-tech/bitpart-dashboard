import { auth } from "@/auth";
import { getBotChallenge } from "@/app/_actions/linkBot";

// components
import AccountPage from "@/app/_components/accountPage";
import { ChallengeForm } from "@/app/_components/challenge";
import NotAuthenticated from "@/app/_components/notAuthenticated";

export default async function Challenge({ params }) {
  const { id } = await params;
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  let challenge = null;
  try {
    challenge = await getBotChallenge(id, session.user.name);
  } catch {
    // not the user's bot, or it no longer exists
  }

  return (
    <AccountPage session={session} title="Solve a Signal captcha">
      <ChallengeForm
        botId={id}
        challenge={challenge}
        username={session.user.name}
      />
    </AccountPage>
  );
}
