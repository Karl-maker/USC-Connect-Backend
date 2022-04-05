const resources = require("./services/resources");
const EventService = require("./services/events");
const NotificationService = require("./services/notifications");
const CampusService = require("./services/campuses");
const StudentService = require("./services/student");
const AdministratorService = require("./services/administrator");

module.exports = {
  resources,
  EventService,
  NotificationService,
  CampusService,
  StudentService,
  AdministratorService,
};
