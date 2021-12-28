const dotenv = require("dotenv");
dotenv.config();
var net = require("net");
const mongoose = require("mongoose");

const listenerService = require("./services/listenerService");
const USER_NAME= process.env.USER_NAME;
const USER_PASSWORD = process.env.USER_PASSWORD;
const MONGO_DB = process.env.MONGO_DB;
const HOST = process.env.HOST;
const PORT = process.env.PORT;
var client = new net.Socket();

const DB =
  `mongodb+srv://${USER_NAME}:${USER_PASSWORD}@encrypted-timeseries.nxkbi.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Connect failed to establish", err);
  });

client.connect(PORT, HOST, () => {
  console.log(`client connected to ${HOST}:${PORT}`);
  // client.write(`Hello, I am ${client.address().address}`);
});

client.on("data", async (data) => {
  try {
    if (data.toString().endsWith("exit")) {
      client.destroy();
    }

    data = data.toString().slice(0, -1);
    let decryptedData = await listenerService.getDecryptedObject(data);
    let validObject = await listenerService.validateObject(decryptedData);
    if (Object.keys(validObject).length === 3) {
      let dbResponse = await listenerService.saveToDb(validObject);
      // then send the obj to fronted
      client.write(`Valid Object - ${JSON.stringify(validObject)} `);
    }
  } catch (err) {
    throw Error("Error occurred while receiving data at client side");
  }
});

// Add a 'close' event handler for the client socket
client.on("close", () => {
  console.log("Client closed");
});
client.on("error", (err) => {
  console.error(err);
});
