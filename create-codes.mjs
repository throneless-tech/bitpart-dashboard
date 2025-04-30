import { Buffer } from "node:buffer";
import { createHash, randomBytes } from "node:crypto";
import fs from "fs";
import { generateSlug } from "random-word-slugs";

async function createAndHashCode() {
  const slug = generateSlug(4);

  // const salt = randomBytes(128).toString('base64');

  // const hash = createHash('sha256')
  //   .update(slug).digest('hex');

  // const slugSaltAndHash = { slug, salt, hash }

  // return slugSaltAndHash;

  return slug;
}

let codes = [];

for (let i = 0; i < 100; i++) {
  let code = await createAndHashCode();
  codes.push({ code: code });
}

const stringCodes = JSON.stringify(codes);

fs.writeFile("codes.json", stringCodes, function (err, result) {
  if (err) console.log("Error: ", err);
});
