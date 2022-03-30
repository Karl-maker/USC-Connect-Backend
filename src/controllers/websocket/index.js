/*

10/02/2022 9:07AM

This file will bring together all controllers to be exported as one.

When importing please proceed as such ( example: const io_controllers = require(../path/folder_name) )


*/

// Controllers OR Namespace Handlers

const { notificationHandler } = require("./controllers/notification");

function websockets(io) {
  /*

    21/02/2022 11:44AM

    Multiple Events can be made..

    _____.on.("example", () => { Logic });
    _____.on.("example", () => { Other Logic });

    */

  notificationHandler(io);
}

module.exports = { websockets };
