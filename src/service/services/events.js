const { Event } = require("../../model");

module.exports = {
  getAll,
  getOneById,
  create,
  delete: _delete,
  update,
};

async function getAll({ page_size, page_number, campus }) {
  let events = [];
  let filter = {};
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  const page = Math.max(0, page_number);
  const date = new Date();

  // Filter by...

  if (campus) {
    filter.campus_name = campus;
  }

  /*

  Get events that didn't pass

  date: { $gte: date.toISOString() }

  */

  if (page_size > 20) {
    //Limit size
    page_size = 20;
  }

  try {
    events = await Event.find({
      date: {
        $gte: date.toISOString(),
      },
      ...filter,
    })
      .limit(page_size)
      .skip(page_size * page)
      .sort({ date: 1 });
  } catch (e) {
    throw new Error(e);
  }

  return events;
}

async function getOneById(id) {
  let event = {};
  try {
    event = await Event.findOne({ _id: id });
  } catch (e) {
    throw new Error(e);
  }

  return event;
}

async function create(details) {
  let event;
  const {
    name,
    date,
    location,
    description,
    campus_name,
    created_by,
    more_details,
  } = details;

  try {
    event = await Event.create({
      name,
      date,
      location,
      description,
      campus_name,
      created_by,
      more_details,
    });
  } catch (e) {
    throw new Error(e);
  }

  return event;
}

async function _delete(id) {
  try {
    await Event.findByIdAndDelete({ _id: id });
  } catch (e) {
    throw new Error(e);
  }

  return;
}

async function update(id, updated_field) {
  let updated_event;
  // updated_field should hold an object that holds the field and change

  // e.g. {name: "New Name"}
  try {
    updated_event = await Event.findOneAndUpdate(
      {
        _id: id,
      },
      updated_field,
      { new: true }
    );
  } catch (e) {
    throw new Error(e);
  }

  return updated_event;
}
