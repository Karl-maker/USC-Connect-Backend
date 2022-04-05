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
const { StudentService } = require("../../../service");
const { authorize, login, register } = require("../../../auth/student");
const { Login } = require("../../../model");
const TOP_URL = "/student";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 60, // Limit each IP to 5 requests in API
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

function studentController(io) {
  router.post(
    `${TOP_URL}/authenticate`,
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 500,
    }),
    getAccessToken
  );
  router.post(`${TOP_URL}/register`, register, registerStudent);
  router.get(`${TOP_URL}/confirm-email`, limiter, confirmStudent);
  router.post(`${TOP_URL}/login`, limiter, login, loginStudent);
  router.post(
    `${TOP_URL}/request-reset-password/:email`,
    rateLimit({
      windowMs: 60 * 60 * 1000, // 60 minutes
      max: 3, // Limit each IP to 3 requests in API
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
    requestResetStudentPassword
  );
  router.delete(
    `${TOP_URL}/authenticate`,
    rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 5,
    }),
    logoutStudent
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
  router.post(`${TOP_URL}/reset-password/:email`, resetStudentPassword);
  router.put(
    `${TOP_URL}/password`,
    rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: 1, // Limit each IP to 1 requests in API
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
    authorize,
    updateStudentPassword
  );
  router.get(`${TOP_URL}`, authorize, (req, res, next) =>
    res.status(200).json(req.student)
  );
  router.delete(`${TOP_URL}`, authorize, deleteStudent);

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

  function logoutStudent(req, res, next) {
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

  function deleteStudent(req, res, next) {
    StudentService.delete(req.student)
      .then(() => res.status(200).json({ message: "Delete" }))
      .catch((err) => next(err));
  }

  function updateStudentPassword(req, res, next) {
    StudentService.updatePassword(req.student.email, req.body.password)
      .then(() => res.status(200).json({ message: "Password Updated" }))
      .catch((err) => next(err));
  }

  function sendConfirmationEmail(req, res, next) {
    const { email } = req.params;
    StudentService.sendConfirmationEmail(email)
      .then(() => {
        res.status(200).json({ message: "Check Email" });
      })
      .catch((err) => {
        next(err);
      });
  }

  function confirmStudent(req, res, next) {
    const { email, token } = req.query;
    StudentService.confirmUserEmail(email, token)
      .then((result) => {
        if (result) res.redirect(`${config.client.URL}/login`);
        else res.redirect(`${config.client.URL}/expired_confirmation`);
      })
      .catch((err) => {
        next(err);
      });
  }

  async function registerStudent(req, res, next) {
    try {
      const { student } = await StudentService.addStudentInfo(req.body);

      res
        .status(200)
        .json({ student: student, message: "Registration Successful" });
    } catch (err) {
      next(err);
    }
  }

  async function loginStudent(req, res, next) {
    const { student, access_token } = req;

    try {
      const refresh_token = await createRefreshToken(student, "STUDENT");

      if (
        (await Login.find({
          user_id: student._id,
          user_type: "STUDENT",
        }).count()) > 4
      ) {
        await Login.findOneAndDelete().sort({ createdAt: 1 });
      }

      await Login.create({
        user_id: student._id,
        user_type: "STUDENT",
        token: refresh_token,
      });

      res
        .cookie("refresh_token", refresh_token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
          path: `/api${TOP_URL}/authenticate`,
        })
        .status(200)
        .json({ access_token, student });
    } catch (err) {
      next(err);
    }
  }

  function requestResetStudentPassword(req, res, next) {
    const email = req.params.email;
    StudentService.requestPasswordReset(email)
      .then(() => {
        res.status(200).json({ message: "Check Email" });
      })
      .catch((err) => {
        next(err);
      });
  }

  function resetStudentPassword(req, res, next) {
    const email = req.params.email;
    StudentService.resetPassword(email, req.body.token, req.body.password)
      .then(() => {
        res.status(200).json({ message: "Password Changed" });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = studentController;
