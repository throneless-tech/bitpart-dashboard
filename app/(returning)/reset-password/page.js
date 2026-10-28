import AccountPage from "@/app/_components/accountPage";
import { ResetPasswordForm } from "@/app/_components/resetPassword";

export default async function ResetPassword({ searchParams }) {
  const { token } = await searchParams;

  return (
    <AccountPage title="Choose a new password">
      <ResetPasswordForm token={typeof token === "string" ? token : ""} />
    </AccountPage>
  );
}
