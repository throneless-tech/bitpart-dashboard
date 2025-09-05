import Papa from "papaparse";
import { sendToEMS } from "@/app/_actions/ems.js";

// list of accepted column headers in the EMS database
const HEADERS = ["provider", "code", "iccid", "smdp", "secret"];
const VPN_HEADERS = ["provider", "secret"];
const ESIM_HEADERS = ["provider", "code", "iccid", "smdp"];

const compare = (a, b) =>
  a.length === b.length && a.every((header, idx) => header === b[idx]);

export const parseCSV = async (botId, botType, fileList) => {
  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.");
  }

  const file = fileList[0];

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: "utf-8",
      complete: (results) => {
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

          let shaped;

          const updatedKeys = Object.keys(item);

          if (
            (botType === "vpn" && compare(updatedKeys, VPN_HEADERS)) ||
            (botType === "esim" && compare(updatedKeys, ESIM_HEADERS))
          ) {
            shaped = {
              bot_id: botId,
              ...item,
            };
          } else {
            return reject("Check your file headers.");
          }

          return shaped;
        });

        sendToEMS(botId, botType, data)
          .then((res) => {
            return resolve(res);
          })
          .catch((err) => {
            return reject(err);
          });
      },
      header: true,
      // download: true,
      skipEmptyLines: "greedy",
    });
  });
};
