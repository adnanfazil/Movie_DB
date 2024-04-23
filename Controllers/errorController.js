const CustomError = require("./../utils/CustomerError");

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const duplicateKeyErrorHandler = (err) => {
  const name = err.keyValue.name;
  const msg = `There is already a movie with name ${name}. Please use another name!`;

  return new CustomError(msg, 400);
};

const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path}: ${err.value}!`;
  return new CustomError(msg, 400);
};

const validationErrorHandler = (err) => {
  // Extract error messages from the validation error object
  const errors = Object.values(err.errors).map((val) => val.message);
  // Concatenate error messages into a single string
  const errorMessages = errors.join(". ");
  // Create a descriptive error message containing the concatenated error messages
  const msg = `Invalid input data: ${errorMessages}`;

  // Return a new CustomError object with the descriptive error message and a status code of 400
  return new CustomError(msg, 400);
};

const handleExpiredJWT = (err) => {
  const msg = `JWT Token has expired. Login again!`;
  return new CustomError(msg, 401);
};

const JsonWebTokenError = (err) => {
  const msg = `Invalid Token. Please login again`;
  return new CustomError(msg, 401);
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try again later.",
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "CastError") {
      error = castErrorHandler(error);
    }
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "TokenExpiredError") error = handleExpiredJWT(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);

    prodErrors(res, error);
  }
};
