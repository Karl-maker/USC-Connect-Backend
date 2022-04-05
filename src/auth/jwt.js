const config = require("../config");
const jwt = require("jsonwebtoken");
const { Administrator, Student, Login } = require("../model");

module.exports = {
  getAccessToken,
  createAccessToken,
  createGeneralToken,
  deleteRefreshToken,
  createRefreshToken,
  getAccessTokenWithRefreshToken,
};

async function createAccessToken(user, user_type) {
  let access_token;
  const body = {
    _id: user._id,
    email: user.email,
  };

  try {
    access_token = await jwt.sign(
      { user: body, user_type },
      config.jwt.ACCESS_TOKEN_PRIVATE_KEY,
      {
        expiresIn: config.jwt.ACCESS_TOKEN_LIFE,
        algorithm: config.jwt.ALGORITHM,
      }
    );
    return access_token;
  } catch (err) {
    throw err;
  }
}

async function getAccessToken(req) {
  let access_token =
    req.headers["x-access-token"] || req.headers["authorization"];

  // Remove Bearer from string
  access_token = access_token.replace(/^Bearer\s+/, "");

  return access_token;
}

async function createRefreshToken(user, user_type) {
  //user_type = ADMIN, STUDENT
  const body = {
    _id: user._id,
    email: user.email,
  };
  const refresh_token = await jwt.sign(
    { user: body, user_type },
    config.jwt.REFRESH_TOKEN_PRIVATE_KEY,
    {
      expiresIn: config.jwt.REFRESH_TOKEN_LIFE,
      algorithm: config.jwt.ALGORITHM,
    }
  );

  return refresh_token;
}

async function getAccessTokenWithRefreshToken(refresh_token) {
  const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;
  let user, login;
  const payload = await jwt.verify(refresh_token, REFRESH_TOKEN_PUBLIC_KEY, {
    algorithm: [config.jwt.ALGORITHM],
  });

  if (!payload) {
    throw { name: "Unauthorized", message: "Expired" };
  }

  try {
    login = await Login.findOne({
      user_id: payload.user._id,
      user_type: payload.user_type,
      token: refresh_token,
    });

    if (payload.user_type === "ADMINISTRATOR") {
      user = await Administrator.findOne({ _id: login.user_id });
    } else if (payload.user_type === "STUDENT") {
      user = await Student.findOne({ _id: login.user_id });
    }
  } catch (err) {
    throw err;
  }

  if (!user) {
    throw { name: "Unauthorized", message: "No User Found" };
  }

  return await createAccessToken(user);
}

async function deleteRefreshToken(refresh_token) {
  const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;

  const payload = await jwt.verify(refresh_token, REFRESH_TOKEN_PUBLIC_KEY, {
    algorithm: [config.jwt.ALGORITHM],
  });

  if (!payload) {
    throw { name: "UnauthorizedError" };
  }

  try {
    await Login.findOneAndDelete({
      user_id: payload.user._id,
      token: refresh_token,
      user_type: payload.user_type,
    });
  } catch (err) {
    throw err;
  }

  return;
}

// GENERAL TOKEN

async function createGeneralToken(email, expires_in) {
  // verify this

  const token = await jwt.sign(
    { user: email },
    config.jwt.GENERAL_KEY_PRIVATE_KEY,
    {
      expiresIn: expires_in || "1h",
      algorithm: config.jwt.ALGORITHM,
    }
  );

  return token;
}
