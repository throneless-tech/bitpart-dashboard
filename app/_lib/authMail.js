import { AsyncLocalStorage } from "node:async_hooks";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/app/_lib/accountEmails";

// better auth only logs errors from its send callbacks, so a server action
// couldn't tell the user an email failed. instead the callbacks hand the
// email to the action that made the call, which sends it itself.
const outbox = new AsyncLocalStorage();

const senders = {
  "verify-email": sendVerificationEmail,
  "reset-password": sendPasswordResetEmail,
};

// run a better auth call, collecting the emails it asks for
export const collectAuthMail = async (call) => {
  const mail = [];
  const result = await outbox.run(mail, call);

  return { result, mail };
};

// send collected emails: true if all were sent, false if any was throttled or
// had no real address. throws if sending fails.
export const sendAuthMail = async (mail) => {
  let sent = mail.length > 0;

  for (const { kind, user, token } of mail) {
    sent = (await senders[kind]({ user, token })) && sent;
  }

  return sent;
};

// better auth send callback: queue the email for collectAuthMail, or send it
// straight away when no action is collecting
export const authMailCallback =
  (kind) =>
  async ({ user, token }) => {
    const mail = outbox.getStore();

    if (mail) {
      mail.push({ kind, user, token });
    } else {
      await senders[kind]({ user, token });
    }
  };
