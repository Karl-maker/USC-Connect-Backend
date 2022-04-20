const express = "express";
const router = express.Router();
const TOP_ROUTE = "/subscription";

/*

See here for routes https://docs.google.com/document/d/11EkRFVFGe0vKpP8KcfVfDpTyRQVRyyPM/edit?usp=drive_web&ouid=117863472905771842840&rtpof=true

*/

const { SubscriptionService } = require("../../../service");

function subscriptionController(io) {
  // Routes
  router.get(`${TOP_ROUTE}/:id`, getOneSubscriptionById);
  router.post(`${TOP_ROUTE}`, createSubscription);
  router.get(`${TOP_ROUTE}s`, getManySubscriptionsByDepartment);
  router.put(`${TOP_ROUTE}/:id`, updateSubscription);
  router.delete(`${TOP_ROUTE}/:id`, deleteSubscription);

  return router;

  // Functions that will link to services

  function getOneSubscriptionById(req, res, next) {
    SubscriptionService.getOneById(req.params.id)
      .then((subscription) => {
        res.status(200).json(subscription);
      })
      .catch((err) => {
        next(err);
      });
  }

  function createSubscription(req, res, next) {
    SubscriptionService.create(req.body)
      .then((subscription) => {
        res.status(200).json(subscription);
      })
      .catch((err) => {
        next(err);
      });
  }

  function getManySubscriptionsByDepartment(req, res, next) {
    SubscriptionService.getAll()
      .then((subscription) => {
        res.status(200).json(subscription);
      })
      .catch((err) => {
        next(err);
      });
  }

  function updateSubscription(req, res, next) {
    SubscriptionService.update(req.params.id)
      .then((subscription) => {
        res.status(200).json(subscription);
      })
      .catch((err) => {
        next(err);
      });
  }

  function deleteSubscription(req, res, next) {
    SubscriptionService.delete(req.params.id)
      .then((subscription) => {
        res.status(200).json({ message: "Deleted Successfully" });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = subscriptionController;
