import Papa from "papaparse";
import fs from "fs";
import { sendToEMS } from "@/app/_actions/ems.js";

// list of accepted column headers in the EMS database
const HEADERS = ["provider", "code", "iccid", "smdp", "secret"];
const VPN_HEADERS = ["provider", "secret"];
const ESIM_HEADERS = ["provider", "code", "iccid", "smdp"];

const compare = (a, b) =>
  a.length === b.length && a.every((header, idx) => header === b[idx]);

export const parseCSV = (botId, botType, fileList) => {
  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.");
  }

  let file;

  if (fileList.length && fileList[0])
    file = fs.readFileSync(`./${fileList[0].name}`);

  Papa.parse(file, {
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

        let toReturn;

        const updatedKeys = Object.keys(item);

        if (
          (botType === "vpn" && compare(updatedKeys, VPN_HEADERS)) ||
          (botType === "esim" && compare(updatedKeys, ESIM_HEADERS))
        ) {
          toReturn = {
            bot_id: botId,
            ...item,
          };
        } else {
          throw new Error("Check your file headers.");
        }

        return toReturn;
      });

      let result;

      try {
        result = await sendToEMS(botId, botType, data);
      } catch (err) {
        console.log("error: ", err);
      }

      return result;
    },
    header: true,
    // download: true,
    skipEmptyLines: "greedy",
  });
};
