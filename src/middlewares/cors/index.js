//What URLs should we share resources with?

const config = require("../../config");
const { Origin } = require("../../model");

const options = () => {
  // Go Database To Load Origins

  let origins = Origin.find({ url: { $exists: 1 } }, { _id: 0, url: 1 });

  return { origin: origins };
};

const corsOrigins = options();

module.exports = { corsOrigins };
