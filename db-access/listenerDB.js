const Valid = require("../models/validModel");

exports.addValidObject = async (completeDecryptedData) => {
  try {
    const current_item = new Valid({
      valid_object: completeDecryptedData,
    });
    const response = await current_item.save();
    return response;
  } catch (err) {
    throw Error("Error while adding item");
  }
};
