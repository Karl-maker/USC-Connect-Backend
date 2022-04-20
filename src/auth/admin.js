const { getAccessToken, createAccessToken } = require("./jwt");
const config = require("../config");
const { Administrator } = require("../model");
const { AdministratorService } = require("../service");
const jwt = require("jsonwebtoken");

/*

Authentication and Authorization processes are handled here by linking to the database and services for administrators

*/

// This middleware will check if user is an admin then allow them to proceed, this acts as a guard to resources

/*

    1. JWT token is taken from HTTP header as a Bearer Token
    2. It is then decrypted and the payload will contain the user's info
    3. This info will be compared and checked

*/

async function authorize(req, res, next) {
  try {
    // Getting and verifying jwt

    const access_token = await getAccessToken(req);
    const ACCESS_TOKEN_PUBLIC_KEY = config.jwt.ACCESS_TOKEN_PUBLIC_KEY;
    const payload = await jwt.verify(access_token, ACCESS_TOKEN_PUBLIC_KEY);

    // Checking if jwt is an Administrator, because both student and admin uses same keys

    if (payload.user_type !== "ADMINISTRATOR") {
      throw { name: "Unauthorized", message: "Not authorized" };
    }

    // Check Database if user exists

    req.administrator = await Administrator.findOne(
      { _id: payload.user._id },
      { token_expiration: 0, token_code: 0, password: 0 }
    );

    // If not an error is thrown and sent to the error handler middleware

    if (!req.administrator) {
      throw { name: "Unauthorized", message: "Not authorized" };
    }

    next();
  } catch (err) {
    next(err);
  }
}

// Login middleware to allow for administrators to sign in

async function login(req, res, next) {
  const { password, email } = req.body;

  try {
    const administrator = await Administrator.findOne({
      email: email.toLowerCase(),
      is_confirmed: true,
    }).select({
      password: 1,
      email: 1,
      first_name: 1,
      last_name: 1,
    });

    if (!administrator) {
      throw {
        name: "NotFound",
        message: "Password or email is incorrect",
      };
    }

    const validate = await administrator.isValidPassword(password);

    if (!validate) {
      throw {
        name: "Unauthorized",
        message: "Email or Password is incorrect",
      };
    }

    // Create and send access_token for admin after confirming login

    let access_token;
    administrator["password"] = null;

    access_token = await createAccessToken(administrator, "ADMINISTRATOR");
    req.access_token = access_token;
    req.administrator = administrator;

    next();
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  // Only take in account email and password

  const { email, password } = req.body;

  try {
    const user = await Administrator.create({
      email: email.toLowerCase(),
      password,
    });

    // Administrators should need to be confirmed through the database or some other means

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authorize,
  login,
  register,
};
