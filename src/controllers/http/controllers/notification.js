const express = require("express");
const router = express.Router();
const TOP_ROUTE = "/notification";
const admin = require("../../../auth/admin");
const { NotificationService } = require("../../../service");

/*

See here for routes https://docs.google.com/document/d/11EkRFVFGe0vKpP8KcfVfDpTyRQVRyyPM/edit?usp=drive_web&ouid=117863472905771842840&rtpof=true

*/

function notificationController(io) {
  // Routes
  router.get(`${TOP_ROUTE}/:id`, getNotificationById);
  router.post(`${TOP_ROUTE}`, admin.authorize, createNotification);
  router.get(`${TOP_ROUTE}s`, getManyNotificationsByDepartment);
  router.delete(`${TOP_ROUTE}/:id`, deleteNotification);

  return router;

  // Functions that will link to services

  function deleteNotification(req, res, next) {
    NotificationService.delete(req.params.id)
      .then(() => res.status(200).json({ message: "Deleted Successfully" }))
      .catch((e) => next(e));
  }

  function getManyNotificationsByDepartment(req, res, next) {
    NotificationService.getManyByDepartment({
      department: req.query.department,
      page_size: req.query.page_size,
      page_number: req.query.page_number,
    })
      .then((notifications) => {
        res.status(200).json(notifications);
      })
      .catch((err) => next(err));
  }

  function getNotificationById(req, res, next) {
    NotificationService.getOneById(req.params.id)
      .then((notification) => {
        res.status(200).json(notification);
      })
      .catch((err) => next(err));
  }

  function createNotification(req, res, next) {
    const { name, description, department } = req.body;
    NotificationService.create({ name, description, department }).then(
      (notification) => {
        // socket.io emit / response
        emitNewNotification(notification.department, notification);
        res.status(200).json(notification);
      }
    );
  }

  // Helper Methods

  function emitNewNotification(department, notification) {
    // After being created the notification needs to be emitted to the approprate NAMESPACE in the specific room
    // Use JSON.stringify until issue with sending mongoose object to POSTMAN is resolved
    io.of("/notification")
      .to(department)
      .emit("updates", {
        notification: JSON.stringify(notification),
        timestamp: new Date(),
      });

    return;
  }
}

module.exports = notificationController;
