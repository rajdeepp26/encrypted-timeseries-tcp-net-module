const mongoose = require("mongoose");

const objectSchema = new mongoose.Schema({
  timeseries: {
    timeField: Date,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  valid_object: {
    type: String,
    required: [true, "Document must have a valid object"],
  },
});

const Valid = mongoose.model("Valid", objectSchema);

module.exports = Valid;
