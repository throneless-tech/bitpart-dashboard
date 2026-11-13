import { createAuthMiddleware } from "better-auth/api";
import { sendTwoFactorCode } from "@/app/_lib/accountEmails";
import { realEmail } from "@/app/_lib/placeholderEmail";

// better auth keeps one twoFactorEnabled flag per user and offers email codes
// to everyone who has it. we track totp (a verified TwoFactor row) and email
// codes (User.emailOtpEnabled) separately; a TwoFactor row with verified false
// only holds the backup codes of an email-code-only user.

// email codes only go to a real, confirmed address (never pendingEmail)
export const canUseEmailCodes = (user) =>
  !!user?.emailVerified && !!realEmail(user);

// the second factors a user can use at password login
export const loginMethods = (user, twoFactor) => [
  ...(twoFactor?.verified ? ["totp"] : []),
  ...(user?.emailOtpEnabled && canUseEmailCodes(user) ? ["otp"] : []),
  ...(twoFactor ? ["backup"] : []),
];

// twoFactor otpOptions.sendOTP. better auth calls it for any user with
// twoFactorEnabled, so check email codes are on and the address can get them.
export const sendTwoFactorOTP = async ({ user, otp }) => {
  if (!user?.emailOtpEnabled || !canUseEmailCodes(user)) {
    return;
  }

  await sendTwoFactorCode({ user, code: otp });
};

const passwordSignInPaths = ["/sign-in/email", "/sign-in/username"];

// replace the methods better auth lists after a password sign-in with the
// ones the user really has. the password was right by this point, so this
// tells nobody else anything.
export const twoFactorMethods = () => ({
  id: "bitpart-two-factor-methods",
  hooks: {
    after: [
      {
        matcher: (ctx) => passwordSignInPaths.includes(ctx.path),
        handler: createAuthMiddleware(async (ctx) => {
          if (!ctx.context.returned?.twoFactorRedirect) {
            return;
          }

          const user = ctx.body?.email
            ? (
                await ctx.context.internalAdapter.findUserByEmail(
                  ctx.body.email,
                )
              )?.user
            : await ctx.context.adapter.findOne({
                model: "user",
                where: [{ field: "username", value: ctx.body?.username }],
              });
          const twoFactor = user
            ? await ctx.context.adapter.findOne({
                model: "twoFactor",
                where: [{ field: "userId", value: user.id }],
              })
            : null;

          return ctx.json({
            twoFactorRedirect: true,
            twoFactorMethods: loginMethods(user, twoFactor),
          });
        }),
      },
    ],
  },
});
