const CustomError = require("../utils/CustomerError");
const User = require("./../Models/userModel");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const util = require("util");

// Function to set JWT token as a cookie
const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    maxAge: process.env.LOGIN_EXPIRES,
    httpOnly: true, // Make cookie accessible only by the web server
    // secure: true, // Enable secure flag (requires HTTPS)
  });
};

exports.signUp = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = jwt.sign({ id: newUser._id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });

  // Set JWT token as a cookie
  setTokenCookie(res, token);

  res.status(200).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    // Corrected condition
    const error = new CustomError(
      "Please provide email and password for login",
      400
    );
    return next(error);
  }

  const user = await User.findOne({ email }).select("+password");

  //console.log(user.password);

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    // Changed to user.password
    const error = new CustomError("Incorrect email or password", 400);
    return next(error);
  }

  const token = jwt.sign({ id: User._id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });

  // Set JWT token as a cookie
  setTokenCookie(res, token);

  res.status(200).json({
    status: "message",
    token,
    data: {
      user,
    },
  });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("You are not logged in!", 401));
  }

  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError(
      "The user with the given token does not exist",
      401
    );
    next(error);
  }

  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const error = new CustomError(
      "The password has been changed recently. Please login again",
      401
    );
    return next(error);
  }

  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(
        "You do not have permission to perform this action",
        403
      );
      next(error);
    }
    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "We could not find the user with given email",
      404
    );
    next(error);
  }

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });
});
