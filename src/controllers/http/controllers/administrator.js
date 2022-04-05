const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const parseCookies = require("../../../utils/cookies");
const {
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
  getAccessTokenWithRefreshToken,
} = require("../../../auth/jwt");
const config = require("../../../config");
const { AdministratorService } = require("../../../service");
const { authorize, login, register } = require("../../../auth/admin");
const { Login } = require("../../../model");
const TOP_URL = "/administrator";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 60, // Limit each IP to 5 requests in API
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

function administratorController(io) {
  router.post(
    `${TOP_URL}/authenticate`,
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 500,
    }),
    getAccessToken
  );
  router.post(`${TOP_URL}/register`, register, registerAdministrator);
  router.post(`${TOP_URL}/login`, limiter, login, loginAdministrator);
  router.post(
    `${TOP_URL}/request-reset-password/:email`,
    rateLimit({
      windowMs: 60 * 60 * 1000, // 60 minutes
      max: 3, // Limit each IP to 3 requests in API
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
    requestResetAdministratorPassword
  );
  router.delete(
    `${TOP_URL}/authenticate`,
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 5,
    }),
    logoutAdministrator
  );
  router.post(
    `${TOP_URL}/send-confirmation-email/:email`,
    rateLimit({
      windowMs: 60 * 60 * 1000, // 60 minutes
      max: 3, // Limit each IP to 3 requests in API
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
    sendConfirmationEmail
  );
  router.post(`${TOP_URL}/reset-password/:email`, resetAdministratorPassword);
  router.put(
    `${TOP_URL}/password`,
    rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: 1, // Limit each IP to 1 requests in API
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
    authorize,
    updateAdministratorPassword
  );
  router.get(`${TOP_URL}`, authorize, (req, res, next) =>
    res.status(200).json(req.administrator)
  );
  router.delete(`${TOP_URL}`, authorize, deleteAdministrator);

  return router;

  // Functions that will link to services

  function getAccessToken(req, res, next) {
    const refresh_token = parseCookies(req).refresh_token;

    getAccessTokenWithRefreshToken(refresh_token)
      .then((access_token) => {
        res.status(200).json({
          access_token,
        });
      })
      .catch((err) => {
        next(err);
      });
  }

  function logoutAdministrator(req, res, next) {
    deleteRefreshToken(parseCookies(req).refresh_token)
      .then(() => {
        res.status(200).json({
          message: "User logged out",
        });
      })
      .catch((err) => {
        next(err);
      });
  }

  function deleteAdministrator(req, res, next) {
    AdministratorService.delete(req.administrator)
      .then(() => res.status(200).json({ message: "Delete" }))
      .catch((err) => next(err));
  }

  function updateAdministratorPassword(req, res, next) {
    AdministratorService.updatePassword(
      req.administrator.email,
      req.body.password
    )
      .then(() => res.status(200).json({ message: "Password Updated" }))
      .catch((err) => next(err));
  }

  function sendConfirmationEmail(req, res, next) {
    const { email } = req.params;
    AdministratorService.sendConfirmationEmail(email)
      .then(() => {
        res.status(200).json({ message: "Check Email" });
      })
      .catch((err) => {
        next(err);
      });
  }

  async function registerAdministrator(req, res, next) {
    try {
      const { administrator } = await AdministratorService.addAdminInfo(
        req.body
      );
      res
        .status(200)
        .json({ administrator, message: "Registration Successful" });
    } catch (err) {
      next(err);
    }
  }

  async function loginAdministrator(req, res, next) {
    const { administrator, access_token } = req;

    try {
      const refresh_token = await createRefreshToken(
        administrator,
        "ADMINISTRATOR"
      );

      if (
        (await Login.find({
          user_id: administrator._id,
          user_type: "ADMINISTRATOR",
        }).count()) > 4
      ) {
        await Login.findOneAndDelete().sort({ createdAt: 1 });
      }

      await Login.create({
        user_id: administrator._id,
        user_type: "ADMINISTRATOR",
        token: refresh_token,
      });

      res
        .cookie("refresh_token", refresh_token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
          path: `/api${TOP_URL}/authenticate`,
        })
        .status(200)
        .json({ access_token, administrator });
    } catch (err) {
      next(err);
    }
  }

  function requestResetAdministratorPassword(req, res, next) {
    const email = req.params.email;
    AdministratorService.requestPasswordReset(email)
      .then(() => {
        res.status(200).json({ message: "Check Email" });
      })
      .catch((err) => {
        next(err);
      });
  }

  function resetAdministratorPassword(req, res, next) {
    const email = req.params.email;
    AdministratorService.resetPassword(email, req.body.token, req.body.password)
      .then(() => {
        res.status(200).json({ message: "Password Changed" });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = administratorController;
