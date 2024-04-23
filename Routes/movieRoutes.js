const express = require("express");
const movieControllers = require("./../Controllers/movieController");
const authControllers = require("./../Controllers/authController");
const Router = express.Router();

Router.route("/movie-stats").get(movieControllers.getMovieStats);

Router.route("/movies-by-genre/:genre").get(movieControllers.getMovieByGenre);

Router.get("/", authControllers.protect, movieControllers.GetAllMovies);

Router.post("/", movieControllers.AddMovie);

Router.get("/:id", authControllers.protect, movieControllers.GetMovie);

Router.delete(
  "/:id",
  authControllers.protect,
  authControllers.restrict("admin"),
  movieControllers.DeleteMovie
);

Router.put("/:id", movieControllers.UpdateMovie);

module.exports = Router;
