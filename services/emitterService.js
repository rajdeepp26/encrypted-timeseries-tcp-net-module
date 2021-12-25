const { Transform } = require("stream");
const crypto = require("crypto");
const NUMBER_OF_OBJECTS = 10;

exports.createObjectFromFile = (fileObject) => {
  let obj = JSON.parse(fileObject);
  let namesLength = obj.names.length;
  let citiesLength = obj.cities.length;

  const transformedObject = {
    name: obj.names[Math.floor(Math.random() * (namesLength - 0) + 0)],
    origin: obj.cities[Math.floor(Math.random() * (citiesLength - 0) + 0)],
    destination: obj.cities[Math.floor(Math.random() * (citiesLength - 0) + 0)],
  };
  return transformedObject;
};

exports.addHashToObject = (transformedObject) => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(transformedObject));
  let hashedValue = hash.digest("hex");
  transformedObject.secret_key = hashedValue;

  return transformedObject;
};

exports.encryptObject = (transformedObjectWithHash) => {
  // const iv = crypto.randomBytes(16).toString("hex").slice(0, 16);
  let key= "12345678123456781234567812345678";
  let iv = "39fd9f350fd145cc";
  // const iv = process.env.IV;
  const message = JSON.stringify(transformedObjectWithHash);
  // const key = process.env.SECRET_KEY;

  const encrypter = crypto.createCipheriv("aes-256-ctr", key, iv);
  let encryptedMessage = encrypter.update(message, "utf8", "hex");

  return encryptedMessage;
};
