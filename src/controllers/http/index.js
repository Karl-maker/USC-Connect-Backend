/*

10/02/2022 9:07AM

This file will bring together all controllers to be exported as one.

When importing please proceed as such ( example: const http_controllers = require(../path/folder_name) )


*/

const express = require("express");
const router = express.Router();

// Controllers

const exampleController = require("./controllers/example");
const eventController = require("./controllers/event");
const notificationController = require("./controllers/notification");
const campusController = require("./controllers/campus");

// Use call feature for passing io because this will seperate HTTP from Websockets

function controllerHandler() {
  const io = this.io;
  router.use(
    exampleController(io),
    eventController(io),
    notificationController(io),
    campusController(io)
  );

  return router;
}

module.exports = controllerHandler;
