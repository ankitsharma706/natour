const express = require('express');
const tourControllers = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
const {
  getAllTours,
  createTour,
  aliasTopTours,
  getTour,
  updateTour,
  deleteTour,
} = tourControllers;

// router.param('id', tourControllers.checkID);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(tourControllers.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTour,
  );

router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour,
  );
// console.log(ID);

module.exports = router;
