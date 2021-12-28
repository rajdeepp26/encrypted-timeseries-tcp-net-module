const dotenv = require("dotenv");
dotenv.config();
const net = require("net");
const { readFileSync } = require("fs");

const emitterService = require("./services/emitterService");
const filename = "./data.json";
let fileObject = readFileSync(filename, "utf8");

const port = process.env.PORT;
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

  //   socket.write("HTTP/1.1 200 OK\n\n");

  const Emitter = setInterval(() => {
    let transformedObject = emitterService.createObjectFromFile(fileObject);
    let transformedObjectWithHash =
      emitterService.addHashToObject(transformedObject);
    let encryptedMessage = emitterService.encryptObject(
      transformedObjectWithHash
    );

    socket.write(encryptedMessage + "|");
  }, TIME_INTERVAL);

  socket.on("data", (data) => {
    console.log(`Client ${clientAddress}: ${data}`);

    // Write the data back to all the connected, the client will receive it as data from the server
    // sockets.forEach((sock) => {
    //   sock.write(
    //     socket.remoteAddress + ":" + socket.remotePort + " said " + data + "\n"
    //   );
    // });
  });

  // Add a 'close' event handler to this instance of socket
  socket.on("close", (data) => {
    clearInterval(Emitter);

    let index = sockets.findIndex((o) => {
      return o.remoteAddress === socket.remoteAddress &&
        o.remotePort === socket.remotePort;
    });
    if (index !== -1) sockets.splice(index, 1);
    console.log(`connection closed: ${clientAddress}`);
  });

  // Add a 'error' event handler to this instance of socket
  socket.on("error", (err) => {
    if (err.code === "ECONNRESET") {
      console.log(`Web client was closed`);
    } else {
      console.log(`Error occurred in ${clientAddress}: ${err.message}`);
    }
  });
});
