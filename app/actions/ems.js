import Papa from 'papaparse';

const parseCSV = (file) => {
  const data = Papa.parse(file, {
    // complete: (results) => {
    //   // if you want you can validate file content here 

    //   console.log('results are: ', results);
    //   return results;

    // },
    header: true,
    // download: true,
    skipEmptyLines: true,
  });

  return data;
};

const sendToEMS = async (botId, json) => {
  const data = {
    "bot_id": botId,
    "codes": json
  }

  fetch(`${process.env.BITPART_SERVER_URL}:${process.env.EMS_PORT}`, {
    method: "post",
    body: JSON.stringify(data),
  })
    .then(res => {
      console.log(res);

    })
    .catch(err => {throw new Error(err.message)})
}

export const emsCall = async (botId, fileList) => {

  if (fileList.length > 1) {
    throw new Error("Only one csv file is allowed.")
  }

  const file = fileList[0];

  const json = Papa.parse(file, {
    complete: (results) => {
      sendToEMS(botId, results);
    },
    // step: function (row) {
    //   console.log("Row:", row.data);
    // },
    header: true,
    // download: true,
    skipEmptyLines: true,
  });

  // const json = parseCSV(file);

  // try {

  // } catch(error) {
  //   throw new Error(error.message);
  // }



  console.log('json is: ', json);

  return json
}