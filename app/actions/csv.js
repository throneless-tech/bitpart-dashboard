import Papa from "papaparse";
import { sendToEMS } from "@/app/actions/ems.js";

export const parseCSV = (botId, botType, fileList) => {
  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.");
  }

  const file = fileList[0];

  Papa.parse(file, {
    encoding: "utf-8",
    complete: (results) => {
      let data = results.data;

      data = data.map((item) => {
        console.log("*****ITEM", item);

        const keys = Object.keys(item);

        keys.forEach((key) => {
          item[key.split("-")[1]] = item[key]; //taking into account the invalid characters that can be introduced depending on UTF formatting
          delete item[key];
        });

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

// item.key.replace(/[^a-zA-Z]/g, '')
