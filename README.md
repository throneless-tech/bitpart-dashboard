# Bitpart Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses the [Chakra UI](https://www.chakra-ui.com) v3 component system, [Auth.js](https://authjs.dev) for authentication, and [Prisma](https://www.prisma.io) to connect to a [PostgreSQL](https://www.postgresql.org/) database.

## Getting Started

### Install dependencies

First, install dependencies from your terminal:

`$ npm install`

### Prepare authentication

Run `npx auth secret` to create a random value for Auth.js. See [their docs](https://authjs.dev/getting-started/installation?framework=next-js) for more info.

Add the following to your `.env.local` file (remember, you will also have a separate `.env` file with other vars):

```
AUTH_SECRET="thisisarandomsecret0123456789="
```

### Attach the databse

This project uses [Prisma ORM](https://www.prisma.io/docs/orm/overview/databases/postgresql) to connect to a PostgreSQL database. You must have a Postgres database running. See the [Postgres website](https://www.postgresql.org/) for more information on starting a PostgreSQL server.

Add the url to the database as your `DATABASE_URL` in your `.env` file.

Run `npx prisma migrate dev` in development or `npx prisma migrate deploy` in production to apply the migrations.

### Seed the database

Navigate to the `prisma/seed.ts.example` file. Duplicate this file within the prisma directory and name it `seed.ts`. It sets up the default state record used to assign new bots to Bitpart servers. Note that the `seed.ts` file will NOT be committed to your version history.

To seed the database, run `npx prisma db seed` in your terminal.

### Bot problem alerts

The dashboard checks every bot with Bitpart's `ReadBot` message in the background and emails the bot's owner when:

- a bot that was linked to Signal becomes unlinked or starts failing,
- the bot's last attempt to send a message `failed`,
- Signal asks for a captcha (`challenge_required`); the email links to a page in the dashboard with instructions and a form to submit the solution,
- Signal is rate limiting the bot (`rate_limited`); the email includes when it will try again.

Owners get at most one email per problem per bot every `BOT_ALERT_COOLDOWN_HOURS` (default 6). Once a problem clears, the next occurrence is emailed straight away. Owners can turn alerts off on their settings page; they're on by default for accounts with an email address.

Each bot is checked once every `BOT_ALERT_POLL_SECONDS` (default 300), at a random point in that interval, so Bitpart sees a steady trickle of requests rather than a burst. At most `BOT_ALERT_CONCURRENCY` checks (default 5) run at once. When several dashboard instances run against the same database, they share a lease in the database so only one of them polls at a time; if that instance stops, another takes over once the lease expires. Set `BOT_ALERT_POLLING_ENABLED=false` to stop an instance from polling.

### Sign-ups

Anyone can create a Bitpart dashboard account. To limit abuse, sign-ups are rate limited per IP address: by default, at most 5 accounts per IP address per hour. Change this with `SIGNUP_RATE_LIMIT_MAX` and `SIGNUP_RATE_LIMIT_WINDOW_MINUTES`. Only a keyed hash of each IP address is stored, and records are deleted once they're older than the window.

The client IP address is read from the `X-Forwarded-For` header, so the dashboard must run behind a reverse proxy that sets it (for example nginx with `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). Set `TRUSTED_PROXY_HOPS` to the number of proxies in front of the dashboard (default 1). Without a proxy, a client can supply its own `X-Forwarded-For` header and get around the limit.

You can also run `npx prisma studio` to view the database info at [http://localhost:5555](http://localhost:5555).

### Run Next

You can run the development server with:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connecting to Bitpart server

For the dashboard to fully function, you will also need to run [bitpart](https://github.com/throneless-tech/bitpart) and [bitpart-ems](https://github.com/throneless-tech/bitpart-ems). Follow the links for instructions on how to run both.

Add to your `.env` file the following:

```
AUTH_DEBUG=true
AUTH_TRUST_HOST=false # true for production build

BITPART_SERVER_HOSTS=127.0.0.1:5000,127.0.0.1:5005,127.0.0.1:5010
BITPART_SERVER_TOKEN="YOURLONGSECRETHERE"

DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/bitpart-dashboard-postgres-instance?schema=public"

EMS_SERVER_HOST=127.0.0.1:3005

APP_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=no-reply@bitp.art
```

`APP_URL` is the public address of the dashboard, used for links in password reset and email confirmation emails. The `SMTP_*` and `MAIL_FROM` settings configure outgoing email; set `SMTP_SECURE=true` for SMTPS (implicit TLS, usually port 465), otherwise STARTTLS is used when the server offers it. See `.env.example` for all settings.

The `.env` is configured to be able to support multiple BITPART_SERVER_HOSTS for load balancing purposes. It will also work with one server host.

## Deployment

The instructions above work for local deployment. However, if you'd like to use a container such as Docker, follow the commands below.

### Container

Ensure your Bitpart, Bitpart EMS and Bitpart dashboard images are all running on the same network. To run the dashboard, customize the following command:
```
podman run -d --name bitpart-dashboard -e AUTH_DEBUG=true -e BITPART_SERVER_HOSTS=127.0.0.1:5000,127.0.0.1:5005,127.0.0.1:5010 -e BITPART_SERVER_TOKEN="YOURLONGSECRETHERE" -e DATABASE_URL="postgresql://postgres:password@bitpart-dashboard-postgres:5432/bitpart-dashboard?schema=public" -e EMS_SERVER_HOST=127.0.0.1:3005 -e AUTH_TRUST_HOST=true -e AUTH_SECRET="thisisarandomsecret0123456789=" -e APP_URL="https://dashboard.example.com" -e SMTP_HOST="smtp.example.com" -e SMTP_PORT=465 -e SMTP_SECURE=true -e SMTP_USER="mailer" -e SMTP_PASSWORD="YOURSMTPPASSWORD" -e MAIL_FROM="no-reply@bitp.art" -p 4000:3000 --network bitpart bitpart-dashboard:latest
```
