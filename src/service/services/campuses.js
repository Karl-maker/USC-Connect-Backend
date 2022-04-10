const { Campus } = require("../../model");

module.exports = {
  create,
  getAll,
  delete: _delete,
  update,
};

async function getAll() {
  let campuses;

  try {
    campuses = await Campus.find({});
    return campuses;
  } catch (err) {
    throw err;
  }
}

async function create({ name, location, phone_number }) {
  try {
    return await Campus.create({ name, location, phone_number });
  } catch (err) {
    throw err;
  }
}

async function _delete(campus_name) {
  try {
    Campus.findOneAndDelete({ name: campus_name });
  } catch (err) {
    throw err;
  }
}

async function update(name, updates) {
  try {
    const campus = await Campus.findOneAndUpdate({ name }, updates, { new: 1 });
    return campus;
  } catch (err) {
    throw err;
  }
}
