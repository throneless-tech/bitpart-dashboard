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
    botType === "esim"
      ? process.env.ESIM_ENDPOINT
      : botType === "vpn"
        ? process.env.VPN_ENDPOINT
        : "";

  let res;

  try {
    res = await fetch(
      `http://${process.env.EMS_SERVER_URL}:${process.env.EMS_PORT}${endpoint}`,
      {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
  } catch (err) {
    console.error("Error uploading data to the database: ", err);
  }

  let text;
  if (res) {
    try {
      text = await res.text();
      console.log("text =>", text);
    } catch (err) {
      console.log("Encountered an error when processing the response: ", err);
    }
  }

  /**
   * 
   *  .then((res) => {
          console.log("res =>", res)
          return res;
        })
        .catch((err) => {
          console.log("err: ", err)
          throw new Error(err.message);
        });
   */
}
