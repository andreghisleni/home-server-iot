// Server
const PORT = 5883;
const PORT_WS = 5884;
// const PORT = 4883;
// const PORT_WS = 4884;

const Server = require("ws").Server;
const ws = new Server({ port: PORT_WS });

const aedes = require("aedes")({
  authenticate: function (client, username, password, callback) {
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
const stateTopics = {};


const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const wsconnections = {};
const sendAll = (msg, uuid = undefined) => {
  for (const w in wsconnections) {
    if (uuid) {
      if (w !== uuid) {
        wsconnections[w].send(msg);
      }
    } else {
      wsconnections[w].send(msg);
    }
  }
};
ws.on("listening", () => {
  console.log(`ws server listening on port ${PORT_WS}`);
});

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

aedes.on("subscribe", (subscriptions, client) => {
  if (subscriptions[0].topic.split("/")[0] !== "$SYS" && subscriptions[0].topic !== "#") {
    let message = `Client ${client.id} just subscribed by ${subscriptions[0].topic}`;

    if (stateTopics[subscriptions[0].topic]) {
      aedes.publish({
        cmd: "publish",
        qos: 2,
        topic: subscriptions[0].topic,
        payload: JSON.stringify({ ...stateTopics[subscriptions[0].topic] }),
        retain: false
      });
    }

    log(message);
  }
});

aedes.on("publish", ({ topic, payload }) => {
  if (topic.split("/")[0] !== "$SYS") {
    console.log(JSON.parse(payload.toString()));
    const { uuid, ...ms } = JSON.parse(payload.toString());

    stateTopics[topic] = ms;

    sendAll(
      JSON.stringify({
        topic,
        message: ms
      }),
      uuid
    );
  }
});

ws.on("connection", function (w) {
  const uuid = uuidv4();
  console.log(`New Connection id : ${uuid}`);
  w.on("message", function (msg) {
    const ms = JSON.parse(msg);
    aedes.publish({
      cmd: "publish",
      qos: 2,
      topic: ms.topic,
      payload: JSON.stringify({ uuid, ...ms.message }),
      retain: false
    });
  });

  w.on('error', (e) => {
    console.log("Websocket error: ", e);
  });

  w.on("close", function () {
    console.log(`Closing :: ${uuid}`);
    delete wsconnections[uuid];
  });
  wsconnections[uuid] = w;
});

server.listen(PORT, function () {
  console.log(`server listening on port ${PORT}`);
});
