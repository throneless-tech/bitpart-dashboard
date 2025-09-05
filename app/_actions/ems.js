"use server";

export async function sendToEMS(botId, botType, json) {
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

  fetch(`http://${process.env.EMS_SERVER_HOST}/${endpoint}`, {
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
}
