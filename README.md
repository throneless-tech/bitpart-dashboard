# Bitpart Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses the [Chakra UI](https://www.chakra-ui.com) v3 component system, [Auth.js](https://authjs.dev) for authentication, and [Prisma](https://www.prisma.io) to connect to a [PostgreSQL](https://www.postgresql.org/) database.

## Getting Started

### Install dependencies

First, install dependencies from your terminal:

`$ npm install`

### Prepare authentication
 
Run `npx auth secret` to create a random value for Auth.js. See [their docs](https://authjs.dev/getting-started/installation?framework=next-js) for more info.

Add the following to your `.env.local` file:

```
NEXTAUTH_SECRET="thisisarandomsecret0123456789="
SESSION_SECRET="thisisanotherrandomsecret0123456789="
```

### Attach the databse
This project uses [Prisma ORM](https://www.prisma.io/docs/orm/overview/databases/postgresql) to connect to a PostgreSQL database. You must have a Postgres database running. See the [Postgres website](https://www.postgresql.org/) for more information on starting a PostgreSQL server.

Add the url to the database as your `DATABASE_URL` in your `.env` file.

Run `prisma migrate dev` in development or `prisma migrate deploy` in production to apply the migrations.

If you would like to seed the database, run `npx prisma db seed` in your terminal.

Run `npx prisma studio` to view the database info at [http://localhost:5555](http://localhost:5555).

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

## TODO Connecting to Bitpart server

Add to your `.env` file the following:

```
AUTH_DEBUG=true

BITPART_SERVER_URL=127.0.0.1
BITPART_SERVER_PORT=5000
BITPART_SERVER_TOKEN="YOURLONGSECRETHERE"

DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/bitpart-dashboard-postgres-instance?schema=public"

EMS_PORT=3005
EMS_ESIM_ENDPOINT="esim_codes_endpoint"
EMS_VPN_ENDPOINT="vpn_tokens_endpoint"

JWT_SECRET="ANOTHERLONGSECRETHERE="
```


## TODO Deployment