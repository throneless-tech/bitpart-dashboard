// better auth needs an email on every user, so accounts without one get a
// unique address on a reserved domain. it is never shown, compared or mailed.
const PLACEHOLDER_DOMAIN = "@no-email.invalid";

export const newPlaceholderEmail = () =>
  `${globalThis.crypto.randomUUID()}${PLACEHOLDER_DOMAIN}`;

export const isPlaceholderEmail = (email) =>
  typeof email === "string" && email.toLowerCase().endsWith(PLACEHOLDER_DOMAIN);

// the user's real email address, or null if they don't have one
export const realEmail = (user) =>
  user?.email && !isPlaceholderEmail(user.email) ? user.email : null;
