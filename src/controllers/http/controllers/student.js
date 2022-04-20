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
const limiter = require("../../../middlewares/rate-limiter");
const TOP_URL = "/student";

function studentController(io) {
  router.post(
    `${TOP_URL}/authenticate`,
    limiter({ minutes: 10, max: 100 }),
    getAccessToken
  );
  router.post(`${TOP_URL}/register`, register, registerStudent);
  router.get(
    `${TOP_URL}/confirm-email`,
    limiter({ minutes: 10, max: 100 }),
    confirmStudent
  );
  router.post(
    `${TOP_URL}/login`,
    limiter({ minutes: 10, max: 100 }),
    login,
    loginStudent
  );
  router.post(
    `${TOP_URL}/request-reset-password/:email`,
    limiter({ minutes: 10, max: 100 }),
    requestResetStudentPassword
  );
  router.delete(
    `${TOP_URL}/authenticate`,
    limiter({ minutes: 10, max: 100 }),
    logoutStudent
  );
  router.post(
    `${TOP_URL}/send-confirmation-email/:email`,
    limiter({ minutes: 10, max: 100 }),
    sendConfirmationEmail
  );
  router.post(`${TOP_URL}/reset-password/:email`, resetStudentPassword);
  router.put(
    `${TOP_URL}/password`,
    limiter({ minutes: 10, max: 100 }),
    authorize,
    updateStudentPassword
  );
  router.get(`${TOP_URL}`, authorize, (req, res, next) => {
    res.status(200).json(req.student);
  });
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
          user_id: student._id.toString(),
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
