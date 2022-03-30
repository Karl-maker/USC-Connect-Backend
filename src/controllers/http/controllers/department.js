const express = ("express");
const router = express.Router();
const TOP_ROUTE = "/department";

// Import service

const { DepartmentService } = require("../../../service");

function departmentController(io) {
	// Routes
		router.get(`${TOP_ROUTE}s`, getDepartments);
		router.post(`${TOP_ROUTE}`, createDepartment);

return router;

	// Methods

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
