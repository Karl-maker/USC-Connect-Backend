const cors = require("cors");
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");

const { corsOrigins } = require("../middlewares/cors");
const { websockets } = require("../controllers/websocket");
const wrapper = require("../middlewares/wrapper");

module.exports = function websocket(io) {
  io.adapter(createAdapter());
  setupWorker(io);

  websockets(io);
};
