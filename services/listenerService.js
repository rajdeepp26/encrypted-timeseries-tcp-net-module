const crypto = require("crypto");
const listenerDB = require("../db-access/listenerDB");

exports.getcompleteDecryptedData = async (
  encryptedDataArray,
  completeDecryptedData
) => {
  try {
    for (let i = 0; i < encryptedDataArray.length; i++) {
      let decryptedData = "";
      if (encryptedDataArray[i].length > 0) {
        decryptedData += await decryptObject(encryptedDataArray[i]);
        let validDecryptedData = await validateObject(decryptedData);
        if (validDecryptedData) {
          completeDecryptedData += validDecryptedData;
        }
      }
    }
    const dbResponse = await listenerDB.addValidObject(completeDecryptedData);
    if (Object.keys(dbResponse).length <= 2) {
      throw Error("Object was not saved in Db");
    }
    let validData = dbResponse.valid_object;
    return validData;
  } catch (err) {
    throw Error("Error while getting all decrypted Data");
  }
};

const decryptObject = async (encryptedData) => {
  try {
    // const iv = crypto.randomBytes(16).toString("hex").slice(0, 16);
    const iv = process.env.IV;
    const key = process.env.SECRET_KEY;
    const decrypter = crypto.createDecipheriv("aes-256-ctr", key, iv);

    let decryptedData = decrypter.update(encryptedData, "hex", "utf-8");
    return decryptedData;
  } catch (err) {
    throw Error("Error while adding decrypting object");
  }
};

const validateObject = async (decryptedData) => {
  try {
    let receivedObject = JSON.parse(decryptedData);

    const testData = {
      name: receivedObject.name,
      origin: receivedObject.origin,
      destination: receivedObject.destination,
    };

    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(testData));
    let testHashedValue = hash.digest("hex");
    if (testHashedValue == receivedObject.secret_key) {
      return JSON.stringify(testData);
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};
