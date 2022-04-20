const express = "express";
const router = express.Router();
const TOP_ROUTE = "/department";
const admin = require("../../../auth/admin");
const { DepartmentService } = require("../../../service");

/*

See here for routes https://docs.google.com/document/d/11EkRFVFGe0vKpP8KcfVfDpTyRQVRyyPM/edit?usp=drive_web&ouid=117863472905771842840&rtpof=true

*/

function departmentController(io) {
  // Routes
  router.get(`${TOP_ROUTE}s`, getDepartments);
  router.post(`${TOP_ROUTE}`, admin.authorize, createDepartment);

  return router;

  // Functions that will link to services

  function getDepartments(req, res, next) {
    DepartmentService.getAll(req.body)
      .then((departments) => {
        res.status(200).json(departments);
      })
      .catch((err) => {
        next(err);
      });
  }

  function createDepartment(req, res, next) {
    DepartmentService.create(req.body)
      .then((department) => {
        res.status(200).json(department);
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = departmentController;
