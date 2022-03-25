const express = require("express");
const router = express.Router();
const TOP_ROUTE = "/campus";

// Import sevice

const { CampusService } = require("../../../service");

function campusController(io) {
  // Routes
  router.get(`${TOP_ROUTE}es`, getCampuses);
  router.post(`${TOP_ROUTE}`, createCampus);

  return router;

  // Methods

  function getCampuses(req, res, next) {
    CampusService.getAll()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  function createCampus(req, res, next) {
    CampusService.create(req.body)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = campusController;
