import Papa from "papaparse";
import { sendToEMS } from "@/app/_actions/ems.js";

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
