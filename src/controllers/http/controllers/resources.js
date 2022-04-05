const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const admin = require("../../../auth/admin");

const service = require("../../../service");
const config = require("../../../config");
const logger = require("../../../log/server");

const TOP_ROUTE = "/resource";
const RESOURCE_PATH = path.join(
  __dirname,
  `../../../../${config.resources.RESOURCE_PATH}`
);

const STORAGE = multer.diskStorage({
  destination: function (req, file, cb) {
    var dir = path.join(`${(__dirname, RESOURCE_PATH)}`, `./${req.params.id}`);

    try {
      // first check if directory already exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        logger.info({
          message: `Resource Directory Created`,
          timestamp: `${new Date().toString()}`,
        });
      } else {
        // Nothing
        logger.info({
          message: `Resource Directory Exists`,
          timestamp: new Date().toString(),
        });
      }
    } catch (err) {
      logger.error({
        message: err,
        timestamp: `${new Date().toString()}`,
      });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    //get file type
    var ext = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});
const uploadPDF = multer({
  storage: STORAGE,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".pdf") {
      return callback(new Error("Only PDF files are allowed"));
    }
    callback(null, true);
  },
}).single("pdf-file");

createDirectory();

function resourceController(io) {
  router.get(`${TOP_ROUTE}s`, getAllResources);
  router.get(`${TOP_ROUTE}/:id`, getResource);
  router.post(`${TOP_ROUTE}`, createResource);
  router.post(`${TOP_ROUTE}/upload/:id`, uploadPDF, resourceUploadStatus);
  router.delete(`${TOP_ROUTE}/:id`, deleteResource);
  router.put(`${TOP_ROUTE}/:id`, updateResource);

  return router;

  // Functions that will link to services

  function resourceUploadStatus(req, res, next) {
    res.status(200).json({ message: "Resource Created Successfully" });
  }

  function getAllResources(req, res, next) {
    service.resources
      .getAll({
        page_size: req.query.page_size,
        page_number: req.query.page_number,
      })
      .then((resources) => {
        res.status(200).json(resources);
      })
      .catch((err) => {
        next(err);
      });
  }

  function getResource(req, res, next) {
    service.resources
      .getOneById(req.params.id)
      .then((resource) => {
        res.status(200).json(resource);
      })
      .catch((err) => {
        next(err);
      });
  }

  function createResource(req, res, next) {
    service.resources
      .create(req.body)
      .then((resource) => {
        res.status(200).json({
          resource: resource,
          message: "Resource Created Successfully",
        });
      })
      .catch((err) => {
        next(err);
      });
  }

  function deleteResource(req, res, next) {
    service.resources
      .delete(req.params.id)
      .then(() => {
        res.status(200).json({ message: "Resource Deleted Successfully" });
      })
      .catch((err) => {
        next(err);
      });
  }

  function updateResource(req, res, next) {
    service.resources
      .update({ id: req.params.id, details: req.body })
      .then((event) => {
        res.status(200).json({
          resource: resource,
          message: "Resource Updated Successfully",
        });
      })
      .catch((err) => {
        next(err);
      });
  }
}

function createDirectory() {
  // Create Path and Folder if Not Existing
  if (!fs.existsSync(RESOURCE_PATH)) {
    fs.mkdirSync(RESOURCE_PATH, {
      recursive: true,
    });
  }
}

module.exports = { resourceController };
