const dotenv = require("dotenv");
dotenv.config();
const net = require("net");
const { readFileSync } = require("fs");

const emitterService = require("./services/emitterService");
const filename = "./data.json";
let fileObject = readFileSync(filename, "utf8");

const EMITTER_PORT = process.env.EMITTER_PORT;
const HOST = process.env.HOST;
const TIME_INTERVAL = 3000;

/**
 * As Emitter Client
 */
let emitterServer = new net.Socket();
emitterServer.connect(process.env.LISTENER_PORT, HOST, () => {
  console.log(`Emitter server connected to host: 2000`);

  const Emitter = setInterval(() => {
    let transformedObject = emitterService.createObjectFromFile(fileObject);
    let transformedObjectWithHash =
      emitterService.addHashToObject(transformedObject);
    let encryptedMessage = emitterService.encryptObject(
      transformedObjectWithHash
    );

    emitterServer.write(encryptedMessage + "|");
  }, TIME_INTERVAL);
});

// emitterServer.on("data", (data) => {
//   console.log(`Client data ${data}`);
// });

emitterServer.on("close", () => {
  clearInterval(Emitter);
  console.log("Listener closed");
});

emitterServer.on("error", (err) => {
  console.error(err);
});

/**
 * As Server accepting client request
 */
const server = net.createServer();
server.listen(EMITTER_PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${EMITTER_PORT}`);
});

let sockets = [];
server.on("connection", (socket) => {
  let clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`new client connected: ${clientAddress}`);
  sockets.push(socket);

  socket.on("data", (data) => {
    console.log(`Client ${clientAddress}: ${data}`);
  });

  // 'close' event handler to this instance of socket
  socket.on("close", (data) => {
    let index = sockets.findIndex((o) => {
      return (
        o.remoteAddress === socket.remoteAddress &&
        o.remotePort === socket.remotePort
      );
    });
    if (index !== -1) sockets.splice(index, 1);
    console.log(`connection closed: ${clientAddress}`);
  });

  // 'error' event handler to this instance of socket
  socket.on("error", (err) => {
    console.log(`Error occurred in ${clientAddress}: ${err.message}`);
  });
});
