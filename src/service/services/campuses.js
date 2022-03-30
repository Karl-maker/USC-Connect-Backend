const { Campus } = require("../../model");

module.exports = {
  create,
  getAll,
  delete: _delete,
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

async function create(info) {
  try {
    Campus.create(info);
  } catch (err) {
    throw err;
  }
}

async function _delete(campus_name) {
  try {
    Campus.delete({ name: campus_name });
  } catch (err) {
    throw err;
  }
}
