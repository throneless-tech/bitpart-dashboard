import Papa from "papaparse";
import { sendToEMS } from "@/app/actions/ems.js";

export const parseCSV = (botId, botType, fileList) => {
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
