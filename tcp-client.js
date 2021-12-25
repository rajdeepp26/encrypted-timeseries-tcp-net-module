var net = require("net");
const HOST = "localhost";
const PORT = 1234;
var client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log(`client connected to ${HOST}:${PORT}`);
  // client.write(`Hello, I am ${client.address().address}`);

});

client.on("data", (data) => {
  console.log(`${data}`);
  // format the string

  // decrypt data

  // validate the object from the hashed string

  // if valid then save in db

  // then send the obj to fronted
  
  client.write(`received - ${data} `)
  if (data.toString().endsWith("exit")) {
    client.destroy();
  }
});

// Add a 'close' event handler for the client socket
client.on("close", () => {
  console.log("Client closed");
});
client.on("error", (err) => {
  console.error(err);
});
