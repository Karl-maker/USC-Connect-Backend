const rateLimit = require("express-rate-limit");

const limiter = ({ minutes, max }) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000, // Within time span of x minutes how many requests can be made to this route
    max: max || 60, // Limit each IP to x requests
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

module.exports = limiter;
