import Papa from "papaparse";
import { sendToEMS } from "@/app/_actions/ems.js";

// list of accepted column headers in the EMS database
const HEADERS = ["provider", "code", "iccid", "smdp", "secret"];

export const parseCSV = (botId, botType, fileList) => {
  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.");
  }

  const file = fileList[0];

  const parsed = Papa.parse(file, {
    encoding: "utf-8",
    complete: async (results) => {
      let data = results.data;

      data = data.map((item) => {
        const keys = Object.keys(item);

        // headers clean up
        keys.map((key) => {
          HEADERS.map((header) => {
            if (key === header) {
              return;
            }
            if (key.includes(header)) {
              item[header] = item[key];
              delete item[key];
            }
          });
        });

        return {
          bot_id: botId,
          ...item,
        };
      });

      const response = await sendToEMS(botId, botType, data);

      return response;
    },
    header: true,
    // download: true,
    skipEmptyLines: "greedy",
  });
  return parsed;
};
