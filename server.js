const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

/*process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception occured! Shutting down...");
  process.exit(1);
});*/

const app = require("./app");

mongoose
  .connect('mongodb://127.0.0.1:27017/movies')
  .then((conn) => {
    //console.log(conn);
    console.log("DB connection successful");
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Server has started");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured! Shutting down....");

  server.close(() => {
    process.exit(1);
  });
});
