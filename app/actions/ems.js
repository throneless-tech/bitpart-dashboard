import Papa from "papaparse";

const sendToEMS = async (botId, botType, json) => {
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
      ? process.env.NEXT_PUBLIC_ESIM_ENDPOINT
      : botType === "vpn"
        ? process.env.NEXT_PUBLIC_VPN_ENDPOINT
        : "";

  fetch(
    `http://${process.env.NEXT_PUBLIC_SERVER_URL}:${process.env.NEXT_PUBLIC_EMS_PORT}/${endpoint}`,
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  )
    .then((res) => {
      return json;
    })
    .catch((err) => {
      throw new Error(err.message);
    });
};

export const emsCall = (botId, botType, fileList) => {
  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.");
  }

  const file = fileList[0];

  Papa.parse(file, {
    complete: (results) => {
      let data = results.data;

      data = data.map((item) => {
        return {
          bot_id: botId,
          ...item,
        };
      });

      sendToEMS(botId, botType, data);
    },
    header: true,
    // download: true,
    skipEmptyLines: "greedy",
  });
};
