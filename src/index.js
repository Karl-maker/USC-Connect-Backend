const { corsOrigins } = require("./middlewares/cors");
const { getArrayItemFromObject } = require("./utils/array");

const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const httpServer = http.createServer(app);

require("./helper/db")(); //Run Code Immediately

module.exports = async function entry() {
  const corsURLs = await getArrayItemFromObject(
    await corsOrigins.origin,
    "url"
  );

  // Setup cors

  const io = require("socket.io")(httpServer, {
    cors: {
      origins: corsURLs,
    },
  });

  app.use(
    cors({
      origin: corsURLs,
      credentials: true,
    })
  );

  // Entry For Both Websocket and HTTP aspect of project

  require("./server/websocket")(io);
  require("./server/http")(app, express, io);
};
