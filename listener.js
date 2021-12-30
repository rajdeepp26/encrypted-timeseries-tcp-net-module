const dotenv = require("dotenv");
dotenv.config();
var net = require("net");
const listenerService = require("./services/listenerService");
const databaseConnect = require("./db-config/databaseConnect");

const HOST = process.env.HOST;
const LISTENER_PORT = process.env.LISTENER_PORT;
databaseConnect();

const server = net.createServer();
server.listen(LISTENER_PORT, HOST, () => {
  console.log(`Listener server listening on ${HOST}:${LISTENER_PORT}`);
});

let sockets = [];
server.on("connection", (socket) => {
  var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`new client connected: ${clientAddress}`);
  sockets.push(socket);

  socket.on("data", async (data) => {
    console.log(`Client ${clientAddress}: ${data}`);
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
        console.log(`Valid Object - ${JSON.stringify(dbResponse)}`)
        // socket.write(`Valid Object - ${JSON.stringify(dbResponse)} `);
      }
    } catch (err) {
      throw Error("Error occurred while receiving data at client side");
    }
  });

  // 'close' event handler to this instance of socket
  socket.on("close", (data) => {
    console.log(`connection closed: ${clientAddress}`);
  });

  // 'error' event handler to this instance of socket
  socket.on("error", (err) => {
    if (err.code === "ECONNRESET") {
      console.log(`Web client was closed`);
    } else {
      console.log(`Error occurred in ${clientAddress}: ${err.message}`);
    }
  });
});
