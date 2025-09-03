const express = require('express');
const userControllers = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
// 3>Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userControllers.getMe, userControllers.getUser);
router.patch(
  '/updateMe',
  userControllers.uploadUserPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe,
);
router.delete('/deleteMe', userControllers.deleteMe);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUsers);
router
  .route('/:id')
  .get(userControllers.getUser)
  .patch(userControllers.UpdateUsers)
  .delete(userControllers.deleteUsers);

module.exports = router;
