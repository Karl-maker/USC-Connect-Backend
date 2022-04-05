const { getAccessToken, createAccessToken } = require("./jwt");
const config = require("../config");
const { Administrator } = require("../model");
const { AdministratorService } = require("../service");
const jwt = require("jsonwebtoken");

async function authorize(req, res, next) {
  try {
    const access_token = await getAccessToken(req);

    const ACCESS_TOKEN_PUBLIC_KEY = config.jwt.ACCESS_TOKEN_PUBLIC_KEY;

    const payload = await jwt.verify(access_token, ACCESS_TOKEN_PUBLIC_KEY);

    if (payload.user_type !== "ADMINISTRATOR") {
      throw { name: "Unauthorized", message: "Not authorized" };
    }

    req.administrator = await Administrator.findOne(
      { _id: payload.user._id },
      { token_expiration: 0, token_code: 0, password: 0 }
    );

    if (!req.administrator) {
      throw { name: "Unauthorized", message: "Not authorized" };
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  const { password, email } = req.body;

  try {
    // May login with email or ID
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

    // Create and send access_token to student after confirming login

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

    //await AdministratorService.sendConfirmationEmail(user.email);

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
