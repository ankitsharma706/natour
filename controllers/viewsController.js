const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1
  const tours = await Tour.find();

  // 2

  // 3

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'guides',
      select: 'name role photo',
    })
    .populate({
      path: 'reviews',
      fields: 'review rating user',
    });

  if (!tour) {
    return next(new AppError('No tour found with that slug', 404));
  }
  // console.log(tour);
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    locations: JSON.stringify(tour.locations),
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com",
    )
    .render('login', {
      title: 'Log into your account',
    });
});

// exports.getAccount = (req, res) => {
//   res.status(200).render('account', {
//     title: 'Your account',
//   });
// };
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
};

// exports.getMyTours = catchAsync(async (req, res, next) => {
//   // 1
//   const bookings = await Booking.find({ user: req.user.id });
//   const tourIDs = bookings.map((el) => el.tour);
//   const tours = await Tour.find({ _id: { $in: tourIDs } });

//   // 2

//   // 3
//   res.status(200).render('overview', {
//     title: 'My Tours',
//     tours,
//   });
// });
exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('tour');
  const tours = bookings.map((el) => el.tour);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   );
//   res.status(200).render('account', {
//     title: 'Your account',
//     user: updatedUser,
//   });
//   // next();
// });
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true },
  );

  req.user = updatedUser; // keep session consistent

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
