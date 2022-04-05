const helmet = require("helmet");
const path = require("path");

const httpLogger = require("../log/http");
const config = require("../config");
const { jsonParser, urlencodedParser } = require("../middlewares/body-parser");
const httpControlHandler = require("../controllers/http");
const errorHandler = require("../middlewares/error-handler");
const { corsOrigins } = require("../middlewares/cors");

module.exports = function http(app, express, io) {
  app.use(helmet());
  app.use(urlencodedParser);
  app.use(jsonParser);
  app.use(httpLogger);
  app.use("/api", httpControlHandler.call({ io: io }));
  app.use(
    "/container",
    express.static(
      path.join(__dirname, `../../${config.resources.RESOURCE_PATH}`)
    )
  );
  app.use("*", (req, res, next) => {
    next({ name: "NotFound", message: "Resource Not Found" });
  });
  app.use(errorHandler);
};
