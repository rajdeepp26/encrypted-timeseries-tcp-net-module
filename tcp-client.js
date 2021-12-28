var net = require("net");
const listenerService = require("./services/listenerService");

const HOST = "localhost";
const PORT = 1234;
var client = new net.Socket();
const mongoose = require("mongoose");

const DB =
  "mongodb+srv://user1:AEDGtX4kPhpG7v5@encrypted-timeseries.nxkbi.mongodb.net/time-series?retryWrites=true&w=majority";

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
