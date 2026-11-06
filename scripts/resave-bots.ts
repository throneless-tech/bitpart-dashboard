// One-time re-save of every bot to its bitpart instance, so stored flows pick
// up the current csml templates. Run inside the dashboard pod:
//   npm run resave-bots            (dry run)
//   npm run resave-bots -- --apply
// Remove once an admin panel can do this.

import { prisma } from "@/lib/prisma";
import { updateBotBitpart } from "@/app/_actions/updateBot";
import { escapeSpecials } from "@/app/_utils/escapeSpecials";

const apply = process.argv.includes("--apply");

// the edit form submits empty inputs as "", which formatCsml expects
const asSubmitted = (bot) =>
  Object.fromEntries(
    Object.entries(bot).map(([key, value]) => [key, value ?? ""]),
  );

async function main() {
  const bots = await prisma.bot.findMany({ orderBy: { createdAt: "asc" } });
  console.log(
    `${bots.length} bots${apply ? "" : " (dry run, pass --apply to re-save)"}`,
  );

  let failed = 0;
  for (const bot of bots) {
    const label = `${bot.bitpartId} [${bot.botType}] on ${bot.instance}`;

    if (!apply) {
      console.log(`would re-save ${label}`);
      continue;
    }

    try {
      const response = await updateBotBitpart(
        escapeSpecials(asSubmitted(bot)),
        bot.bitpartId,
        bot.passcode,
        bot.instance,
      );

      if (response?.message_type === "Error") {
        throw new Error(JSON.stringify(response.data?.response));
      }

      console.log(`re-saved ${label}`);
    } catch (error) {
      failed++;
      console.error(`FAILED ${label}: ${error.message}`);
    }
  }

  if (failed) {
    console.error(`${failed} of ${bots.length} bots failed`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
