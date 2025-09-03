const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    secure: false,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }
  // 2>
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  // 3>
  const currentUser = await User.findById(decoded.id);
  // res.clearCookie('jwt', {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  // });
  if (!currentUser) {
    return next(
      new AppError(
        'The User belonging to this token does no longer exist.',
        401,
      ),
    );
  }
  // 4>
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }
  //grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 3>
      const currentUser = await User.findById(decoded.id);
      // res.clearCookie('jwt', {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      // });
      if (!currentUser) {
        return next();
      }
      // 4>
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// exports.restrictTo = (...roles) => {
//   const user = req.user || res.locals.user;
//   return (req, res, next) => {
//     // roles
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action', 403),
//       );
//     }
//     next();
//   };
// };
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    const user = req.user || res.locals.user; // <-- check both
    if (!user) return next(new AppError('Not authenticated', 401));
    if (!roles.includes(user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user posted on mail
  const user = await User.findOne({ email: req.body.email });
  // console.log(req.body.email);
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email.Try again later!',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2
  if (!user) {
    return next(new AppError('Token is Invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  // 3

  // 4
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1
  const user = await User.findById(req.user.id).select('+password');

  // 2
  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your Current password is Wrong.', 401));
  }
  // 3
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4
  createSendToken(user, 200, res);
});
