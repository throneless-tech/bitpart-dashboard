"use server";
import { emsUrl } from "@/app/_lib/bitpart";
import { withSpan } from "@/app/_lib/otel";

// the upload is traced by its size only, never the codes themselves
export async function sendToEMS(botId, botType, json) {
  return withSpan(
    "ems.upload",
    {
      bot_id: botId,
      "bot.type": botType,
      "ems.items": Array.isArray(json) ? json.length : 0,
    },
    async () => uploadToEMS(botId, botType, json),
  );
}

const uploadToEMS = async (botId, botType, json) => {
  let data = {};

  if (botType === "esim") {
    data = {
      bot_id: botId,
      codes: json,
    };
  } else if (botType === "vpn") {
    data = {
      bot_id: botId,
      tokens: json,
    };
  }

  const endpoint =
    botType === "esim" ? "esim_codes" : botType === "vpn" ? "vpn_tokens" : "";

  fetch(emsUrl(endpoint), {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

// STUB: removes a bot's codes/tokens from the EMS on deletion.
export async function deleteFromEMS(_botId, _botType) {
  return;
}
