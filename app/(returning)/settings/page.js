import { auth } from "@/auth";
import { getAccountSettings } from "@/app/_actions/account";

// components
import AccountPage from "@/app/_components/accountPage";
import NotAuthenticated from "@/app/_components/notAuthenticated";
import Settings from "@/app/_components/settings";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) return <NotAuthenticated />;

  const account = await getAccountSettings(session.user.name);

  if (!account) return <NotAuthenticated />;

  return (
    <AccountPage session={session} title="Settings">
      <Settings account={account} />
    </AccountPage>
  );
}
