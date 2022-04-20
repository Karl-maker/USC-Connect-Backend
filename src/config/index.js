require("dotenv-flow").config({
  silent: true,
});

/*

  Central point of all major variables that are needed to run the service.

  Everything should be edited or altered to fit the CPU it will be ran on by using .env files.

  A .example.env file will be avaliable to display all variables used by the system.

*/

const path = require("path");
var LOG_LOCATION;
const ENV = process.env;

let ACCESS_KEYS = { public: "", private: "" };
let REFRESH_KEYS = { public: "", private: "" };
let GENERAL_KEYS = { public: "", private: "" };

try {
  LOG_LOCATION = path.resolve(__dirname, ENV.LOG_FILE);
} catch (err) {
  LOG_LOCATION = path.resolve(__dirname, "../../logs/errors.log");
}

try {
  ACCESS_KEYS = JSON.parse(ENV.ACCESS_KEYS);
  REFRESH_KEYS = JSON.parse(ENV.REFRESH_KEYS);
} catch (err) {
  console.error({
    message: "Issue with parsing keys. Please check your config variables",
    timestamp: new Date().toString(),
  });
}

try {
  GENERAL_KEYS = JSON.parse(ENV.GENERAL_KEYS);
} catch (err) {
  console.error({
    message:
      "Issue with parsing general keys. Please check your config variables",
    timestamp: new Date().toString(),
  });
}

const variables = {
  environment: {
    NODE_ENV: ENV.NODE_ENV || "development",
  },

  resources: {
    RESOURCE_PATH: ENV.RESOURCE_PATH || "container/resources", // From root
    CONTAINER_PATH: ENV.CONTAINER_PATH || "container", // From root
  },

  //Server API
  server: {
    PROTOCOL: ENV.PROTOCOL || "http",
    HOST: ENV.HOST || "localhost",
    PORT: ENV.PORT || 3000,
    URL: ENV.URL || `http://localhost:${ENV.PORT || 3000}`,
  },

  client: {
    URL: ENV.CLIENT_URL || `http://localhost:${8000}`,
  },

  debug: {
    LOG_FILE: LOG_LOCATION,
    LOG_MAXFILES: ENV.LOG_MAXFILES || 5,
    LOG_MAXSIZE: ENV.LOG_MAXSIZE || 5242880,
  },

  db: {
    URI: ENV.DB_URI,
    USER: ENV.DB_USER,
    PASSWORD: ENV.DB_PASSWORD,
    NAME: ENV.DB_NAME,
  },

  email: {
    SERVICE: ENV.EMAIL_SERVICE || "Gmail",
    ADDRESS: ENV.EMAIL_ADDRESS,
    PASSWORD: ENV.EMAIL_PASSWORD,
  },

  jwt: {
    ACCESS_TOKEN_PUBLIC_KEY: ACCESS_KEYS.public,
    ACCESS_TOKEN_PRIVATE_KEY: ACCESS_KEYS.private,
    ACCESS_TOKEN_LIFE: ENV.ACCESS_TOKEN_LIFE || "30d",

    GENERAL_KEY_PUBLIC_KEY: GENERAL_KEYS.public,
    GENERAL_KEY_PRIVATE_KEY: GENERAL_KEYS.private,

    REFRESH_TOKEN_PUBLIC_KEY: REFRESH_KEYS.public,
    REFRESH_TOKEN_PRIVATE_KEY: REFRESH_KEYS.private,
    REFRESH_TOKEN_LIFE: ENV.REFRESH_TOKEN_LIFE || "30d",

    ISSUER: ENV.JWT_ISSUER || "USC Connect",
    ALGORITHM: ENV.JWT_ALGORITHM || "RS256",
    IS_HTTPS: ENV.JWT_IS_HTTPS || false,
  },

  bcrypt: {
    SALTORROUNDS: 10,
  },
};

const config = { ...variables };

module.exports = config;
