const nodemailer = require("nodemailer");

/*

22/02/2022 12:31AM

If University wants to use Email services they can enter info about it for use

*/

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "Gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
