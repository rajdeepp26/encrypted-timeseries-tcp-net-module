const net = require("net");
const { readFileSync } = require("fs");

const emitterService = require("./services/emitterService");
const filename = "./data.json";

const port = 1234;
const host = "localhost";
const TIME_INTERVAL = 3000;

const server = net.createServer();
server.listen(port, host, () => {
  console.log(`TCP server listening on ${host}:${port}`);
});

let sockets = [];
server.on("connection", (socket) => {
  var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`new client connected: ${clientAddress}`);
  sockets.push(socket);

  // let fileData = "";
  let fileObject = readFileSync(filename, "utf8");

  const Emitter = setInterval(() => {
    let transformedObject = emitterService.createObjectFromFile(fileObject)
    let transformedObjectWithHash = emitterService.addHashToObject(transformedObject)
    let encryptedMessage = emitterService.encryptObject(transformedObjectWithHash)

    socket.write(encryptedMessage+"|");
  }, TIME_INTERVAL);

  

  socket.on("data", (data) => {
    console.log(`Client ${clientAddress}: ${data}`);

  });

  // Add a 'close' event handler to this instance of socket
  socket.on("close", (data) => {
    clearInterval(Emitter);
    let index = sockets.findIndex((o) => {
      return (
        o.remoteAddress === socket.remoteAddress &&
        o.remotePort === socket.remotePort
      );
    });
    if (index !== -1) sockets.splice(index, 1);
    sockets.forEach((sock) => {
      sock.write(`${clientAddress} disconnected\n`);
    });
    console.log(`connection closed: ${clientAddress}`);
  });

  // Add a 'error' event handler to this instance of socket
  socket.on("error", (err) => {
    console.log(`Error occurred in ${clientAddress}: ${err.message}`);
  });
});
