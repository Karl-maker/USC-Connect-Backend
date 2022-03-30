const { Notification } = require("../../model");

module.exports = {
  getOneById,
  create,
  getManyByDepartment,
  delete: _delete,
};

async function create(details) {
  let notification;
  const { name, description, department } = details; // from req.body

  try {
    // Create document
    notification = await Notification.create({
      name,
      description,
      department,
    });
  } catch (e) {
    throw new Error(e);
  }

  return notification;
}

async function getOneById(id) {
  let notification;

  try {
    notification = await Notification.findOne({ _id: id });
  } catch (e) {
    throw new Error(e);
  }

  return notification;
}

async function getManyByDepartment({ department, page_size, page_number }) {
  /*

    Students will need to able to see all notifications based on departments

  */
  let notifications = [];
  page_size = parseInt(page_size, 10);
  page_number = parseInt(page_number, 10);
  const page = Math.max(0, page_number);

  if (page_size > 20) {
    //Limit size
    page_size = 20;
  }

  try {
    notifications = await Notification.find({ department: department })
      .limit(page_size)
      .skip(page_size * page)
      .sort({ created_at: -1 });

    // sort({created_at: -1}) <==== This is to find the latest notifications to oldest
  } catch (e) {
    throw new Error(e);
  }

  return notifications;
}

async function _delete(id) {
  try {
    await Notification.findByIdAndDelete({ _id: id });
  } catch (e) {
    throw new Error(e);
  }

  return;
}
