const { getAccessToken, createAccessToken } = require("./jwt");
const config = require("../config");
const { Student } = require("../model");
const { StudentService } = require("../service");
const jwt = require("jsonwebtoken");

async function authorize(req, res, next) {
  try {
    const access_token = await getAccessToken(req);

    const ACCESS_TOKEN_PUBLIC_KEY = config.jwt.ACCESS_TOKEN_PUBLIC_KEY;

    const payload = await jwt.verify(access_token, ACCESS_TOKEN_PUBLIC_KEY);

    if (payload.user_type !== "STUDENT") {
      throw { name: "Unauthorized", message: "Not authorized" };
    }

    req.student = await Student.findOne(
      { _id: payload.user._id },
      { token_expiration: 0, token_code: 0, password: 0 }
    );

    if (!req.student) {
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
    const student = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { student_id: email }],
    }).select({
      password: 1,
      email: 1,
      student_id: 1,
      first_name: 1,
      last_name: 1,
    });

    if (!student) {
      throw {
        name: "NotFound",
        message: "Email or Password is incorrect",
      };
    }

    const validate = await student.isValidPassword(password);

    if (!validate) {
      throw {
        name: "Unauthorized",
        message: "Email or Password is not correct",
      };
    }

    // Create and send access_token to student after confirming login

    let access_token;
    student["password"] = null;

    access_token = await createAccessToken(student, "STUDENT");
    req.access_token = access_token;
    req.student = student;

    next();
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  // Only take in account email and password

  const { email, password } = req.body;

  try {
    const user = await Student.create({
      email: email.toLowerCase(),
      password,
    });

    await StudentService.sendConfirmationEmail(user.email);

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
