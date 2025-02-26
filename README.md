This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses the [Chakra UI](https://www.chakra-ui.com) v3 component system.

## Getting Started

### Run Next

First, install dependencies from your terminal:

`$ npm install`

Then, run the development server:

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

### Attach the databse
This project uses [Prisma](https://www.prisma.io) ORM to connect to a PostgreSQL database. You must have a Postgres database running. See the [Postgres website](https://www.postgresql.org/) for more information.

Add the url to the database as your `DATABASE_URL` in your `.env` file.

If you would like to seed the database, run `npx prisma db seed` in your terminal.

Run `npx prisma studio` to view the database info at [http://localhost:5555](http://localhost:5555).

## TODO Connecting to Bitpart server

Fix your `.env` file TKTKTKTK

## TODO Deployment