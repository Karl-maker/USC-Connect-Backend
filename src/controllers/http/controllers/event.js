const express = require("express");
const router = express.Router();
const TOP_ROUTE = "/event";
const admin = require("../../../auth/admin");
const { EventService } = require("../../../service");

function eventController(io) {
  // Routes
  router.get(`${TOP_ROUTE}s`, getEvents);
  router.post(`${TOP_ROUTE}`, admin.authorize, createEvent);
  router.get(`${TOP_ROUTE}/:id`, getOneEventById);
  router.put(`${TOP_ROUTE}/:id`, admin.authorize, updateEvent);
  router.delete(`${TOP_ROUTE}/:id`, admin.authorize, deleteEvent);

  return router;

  // Functions that will link to services

  function getEvents(req, res, next) {
    EventService.getAll({
      page_size: req.query.page_size,
      page_number: req.query.page_number,
      campus: req.query.campus_name,
      category: req.query.category,
      department: req.query.department,
    })
      .then((events) => {
        res.status(200).json(events);
      })
      .catch((err) => next(err));
  }

  function createEvent(req, res, next) {
    const body = req.body;

    EventService.create({
      name: body.name,
      date: body.date,
      location: body.location,
      description: body.description,
      campus_name: body.campus_name,
      created_by: req.administrator.email,
      more_details: body.more_details,
      admin_id: req.administrator._id,
    })
      .then((event) => {
        res.status(200).json(event);
      })
      .catch((err) => next(err));
  }

  function deleteEvent(req, res, next) {
    EventService.delete(req.params.id)
      .then(() => {
        res.status(200).json({ message: "Successfully Deleted" });
      })
      .catch((err) => next(err));
  }

  function getOneEventById(req, res, next) {
    EventService.getOneById(req.params.id)
      .then((event) => res.status(200).json(event))
      .catch((err) => next(err));
  }

  function updateEvent(req, res, next) {
    EventService.update(req.params.id, req.body)
      .then((event) => res.status(200).json(event))
      .catch((err) => next(err));
  }
}

module.exports = eventController;
