import { auth } from "@/auth";
import AccountPage from "@/app/_components/accountPage";
import { VerifyEmailForm } from "@/app/_components/verifyEmail";

export default async function VerifyEmail({ searchParams }) {
  const { token } = await searchParams;
  const session = await auth();

  return (
    <AccountPage session={session} title="Confirm your email address">
      <VerifyEmailForm
        loggedIn={!!session}
        token={typeof token === "string" ? token : ""}
      />
    </AccountPage>
  );
}
