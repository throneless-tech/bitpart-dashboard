import AccountPage from "@/app/_components/accountPage";
import { ForgotPasswordForm } from "@/app/_components/forgotPassword";

export default function ForgotPassword() {
  return (
    <AccountPage title="Reset your password">
      <ForgotPasswordForm />
    </AccountPage>
  );
}
