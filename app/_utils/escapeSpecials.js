const skipKeys = [
  "adminPhones",
  "bitpartId",
  "botType",
  "countryCode",
  "createdAt",
  "creatorId",
  "id",
  "instance",
  "passcode",
  "phone",
  "qrLink",
  "updatedAt",
];

const arrayKeys = ["faq", "locations", "plans", "problems"];

export function escapeSpecials(data) {
  const formatted = structuredClone(data);
  const regex = /\\([\s\S])|(")/g;
  const slug = "\\$1$2";

  if (formatted && Object.keys(formatted).length != 0) {
    Object.keys(formatted).map((key) => {
      if (skipKeys.includes(key)) {
        // skip certain fields that we do not want to format
        return;
      } else if (typeof formatted[key] === "string") {
        // format fields that contain a string
        formatted[key] = formatted[key].replace(regex, slug);
      } else if (Array.isArray(formatted[key])) {
        // format fields within an array
        formatted[key].map((field) => {
          Object.keys(field).map((k) => {
            field[k] = field[k].replace(regex, slug);
          });
        });
      }
    });
  }

  return formatted;
}
