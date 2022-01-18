// Server
const PORT = 5050;

const aedes = require("aedes")({
  authenticate: function(client, username, password, callback) {
    if (password) {
      password = Buffer.from(password).toString();
    }
    callback(
      null,
      username === "91c697e13d18dfb7a06de6542c39e98b" &&
        password === "74126b8ef52442fb476d42696eb95f8e"
    );
  }
});
const server = require("net").createServer(aedes.handle);

// helper function to log date+text to console:
const log = text => {
  console.log(`[${new Date().toLocaleString()}] ${text}`);
};

// client connection event:
aedes.on("client", client => {
  let message = `Client ${client.id} just connected`;
  log(message);
});

//client disconnection event:
aedes.on("clientDisconnect", client => {
  message = `Client ${client.id} just DISconnected`;
  log(message);
});

server.listen(PORT, function() {
  console.log(`server listening on port ${PORT}`);
});
