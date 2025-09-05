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

  console.log("Sending to EMS");

  fetch(`http://${process.env.EMS_SERVER_HOST}/${endpoint}`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw new Error(err.message);
    });

  let text;

  if (res) {
    try {
      text = await res.text();
      console.log("text =>", text);
    } catch (err) {
      console.log("Encountered an error when processing the response: ", err);
    }
  }

  return text;
}
