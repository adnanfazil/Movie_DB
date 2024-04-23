const express = require("express");
const morgan = require("morgan");
const movieRouter = require("./Routes/movieRoutes");
const authRouter = require("./Routes/authRoutes");
const CustomError = require("./utils/CustomerError");
const globalErrorHandler = require("./Controllers/errorController");
const cookieparser = require("cookie-parser");
const path = require("path");

let app = express();

app.use(express.json());
app.use(cookieparser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});
// View engine setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/users", authRouter);
app.use("/movies", movieRouter);

app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Cannot find the ${req.originalUrl} on the server`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
