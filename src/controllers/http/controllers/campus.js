const express = require("express");
const router = express.Router();
const TOP_ROUTE = "/campus";
const admin = require("../../../auth/admin");
const { CampusService } = require("../../../service");

/*

See here for routes https://docs.google.com/document/d/11EkRFVFGe0vKpP8KcfVfDpTyRQVRyyPM/edit?usp=drive_web&ouid=117863472905771842840&rtpof=true

*/

function campusController(io) {
  // Routes
  router.get(`${TOP_ROUTE}es`, getCampuses);
  router.post(`${TOP_ROUTE}`, admin.authorize, createCampus);
  router.put(`${TOP_ROUTE}/:campus_name`, admin.authorize, updateCampus);
  router.delete(`${TOP_ROUTE}/:campus_name`, admin.authorize, deleteCampus);

  return router;

  // Functions that will link to services

  function deleteCampus(req, res, next) {
    CampusService.delete(req.params.campus_name)
      .then((result) => {
        res.status(200).json({ message: "Deleted Successfully" });
      })
      .catch((err) => {
        next(err);
      });
  }

  function updateCampus(req, res, next) {
    CampusService.update(req.params.campus_name, req.body)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

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
