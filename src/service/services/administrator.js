const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { createGeneralToken } = require("../../auth/jwt");
const logger = require("../../log/server");
const { sendEmail } = require("../../utils/email");
const config = require("../../config");
const { Administrator } = require("../../model");

module.exports = {
  sendConfirmationEmail,
  confirmUserEmail,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  delete: _delete,
  addAdminInfo,
};

async function addAdminInfo({ email, first_name, last_name }) {
  let administrator;

  try {
    administrator = await Administrator.findOneAndUpdate(
      { email: email },
      { first_name, last_name },
      { new: 1 }
    );

    return { administrator };
  } catch (err) {
    throw new Error(err);
  }
}

async function _delete(administrator) {
  try {
    await Administrator.findOneAndDelete({ email: administrator.email });
  } catch (err) {
    throw new Error(err);
  }

  return;
}

async function setConfirmationToken(email, expires) {
  let token, user;

  // Create token and send to database

  token = await createGeneralToken(email, expires);

  try {
    administrator = await Administrator.findOneAndUpdate(
      { email },
      { confirm_account_token: token }
    );
  } catch (e) {
    throw new Error(e);
  }

  return token;
}

async function sendConfirmationEmail(email) {
  // Get tokens involved

  let token;

  if (await Administrator.exists({ email, is_confirmed: 1 })) {
    throw { name: "Forbidden", message: "User already has a confirmed email" };
  }

  try {
    token = await setConfirmationToken(email, "1h");
  } catch (e) {
    throw new Error(e);
  }

  try {
    sendEmail(
      email,
      "Confirm Account",
      {
        link: `${config.server.URL}/api/confirm-email?email=${email}&token=${token}`,
      },
      "ConfirmEmail"
    );
  } catch (e) {
    logger.error({
      timestamp: new Date().toString(),
      error: e,
      message: "Issue Sending Email",
    });
  }
}

async function updatePassword(email, password) {
  try {
    const hash = await bcrypt.hash(password, config.bcrypt.SALTORROUNDS);
    await Administrator.updateOne(
      { email: email },
      { $set: { password: hash } },
      { new: true }
    );
  } catch (err) {
    throw new Error(err);
  }

  return;
}

async function resetPassword(email, token, password) {
  try {
    if (
      (await jwt.verify(token, config.jwt.GENERAL_KEY_PUBLIC_KEY)) &&
      (await Administrator.exists({
        email: email,
        reset_password_token: token,
      }))
    ) {
      await updatePassword(email, password);
    } else {
      throw { name: "NotFound", message: "Issue Resetting Password" };
    }
  } catch (err) {
    throw new Error(err);
  }
  return;
}

async function requestPasswordReset(email) {
  const administrator = await Administrator.findOne({ email });

  if (!administrator)
    throw { name: "NotFound", message: "User does not exist" };

  const token = await createGeneralToken(email, "1h");

  // Add reset_password_token

  await Administrator.findOneAndUpdate(
    { email: administrator.email },
    { reset_password_token: token }
  );

  const link = `${config.client.URL}/password_reset?token=${token}&id=${administrator.email}`;
  sendEmail(
    administrator.email,
    "Reset Password",
    { first_name: administrator.first_name, link: link },
    "requestResetPassword"
  );
  return;
}

async function confirmUserEmail(email, token) {
  try {
    if (await Administrator.exists({ email })) {
      // Check JWT if not expired

      if (await jwt.verify(token, config.jwt.GENERAL_KEY_PUBLIC_KEY)) {
        await Administrator.findOneAndUpdate(
          { email },
          { is_confirmed: 1, confirm_account_token: null }
        );
      }
    } else {
      throw { name: "NotFound", message: "Issue Confirming User" };
    }
  } catch (err) {
    return false;
  }

  return true;
}
