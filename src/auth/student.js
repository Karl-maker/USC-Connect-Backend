const { getAccessToken, createAccessToken } = require("./jwt");
const config = require("../config");
const { Student } = require("../model");
const { StudentService } = require("../service");
const jwt = require("jsonwebtoken");

/*

Authentication and Authorization processes are handled here by linking to the database and services for student

*/

// This middleware will check if user is an student then allow them to proceed, this acts as a guard to resources

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

    // Checking if jwt is an Student, because both student and admin uses same keys

    if (payload.user_type !== "STUDENT") {
      throw { name: "Unauthorized", message: "Not authorized" };
    }

    // Check Database if user exists

    req.student = await Student.findOne(
      { _id: payload.user._id },
      { token_expiration: 0, token_code: 0, password: 0 }
    );

    // If not an error is thrown and sent to the error handler middleware

    if (!req.student) {
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
    // May login with email or Student ID, doesn't check if email is confirmed at the moment
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
