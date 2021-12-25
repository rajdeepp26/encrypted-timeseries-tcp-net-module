var net = require("net");
const listenerService = require("./services/listenerService");

const HOST = "localhost";
const PORT = 1234;
var client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log(`client connected to ${HOST}:${PORT}`);
  // client.write(`Hello, I am ${client.address().address}`);
});

client.on("data", async (data) => {
  if (data.toString().endsWith("exit")) {
    client.destroy();
  }
  try {
    data = data.toString().slice(0, -1);
    let decryptedData = await listenerService.getDecryptedObject(data);
    let validObject = await listenerService.validateObject(decryptedData);
    if (Object.keys(validObject).length === 3) {
      // then send the obj to fronted
      client.write(`received - ${JSON.stringify(validObject)} `);
    }
  } catch (err) {
    throw Error("Error occurred while receiving data at client side")
  }
});

// Add a 'close' event handler for the client socket
client.on("close", () => {
  console.log("Client closed");
});
client.on("error", (err) => {
  console.error(err);
});
