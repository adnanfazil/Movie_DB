const fs = require("fs");
const Movie = require("./../Models/movieModels");
const { json } = require("express");
const ApiFeatures = require("./../utils/ApiFeatures");
const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const CustomError = require("./../utils/CustomerError");
const jwt = require('jsonwebtoken');

exports.GetAllMovies = asyncErrorHandler(async (req, res) => {
  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let movies = await features.query;

  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

exports.GetMovie = asyncErrorHandler(async (req, res) => {
  const movies = await Movie.findById(req.params.id);

  if (!movie) {
    const error = new CustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(200).json({
    status: "Success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

exports.AddMovie = asyncErrorHandler(async (req, res, next) => {
  const{name,ratings,releaseDate,releaseYear,genres,description,duration,createdBy}=req.body;
  const token=req.cookies?.token;

  console.log(req.cookies.token)
  console.log(token)
  const decode =jwt.decode(token,process.env.SECRET_STR);
  req.loggeduser={email:decode.email};
  const movie = await Movie.create({
    userId:req.loggeduser.email,
    name,
    ratings,
    description,
    duration,
    releaseYear,
    releaseDate,
    genres,
    createdBy

  })
  res.status(201).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.DeleteMovie = asyncErrorHandler(async (req, res) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    const error = new CustomError('Movie with that ID is not found!", 404');
    return next(error);
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

exports.UpdateMovie = asyncErrorHandler(async (req, res) => {
  const id = req.params.id; // Get the movie ID from URL params
  const { name, description, duration, ratings } = req.body;

  const updatedMovie = await Movie.findByIdAndUpdate(
    id,
    { name, description, duration, ratings },
    { new: true }
  );

  if (!updatedMovie) {
    const error = new CustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(200).json({
    status: "success",
    data: {
      movie: updatedMovie,
    },
  });
});

exports.getMovieStats = asyncErrorHandler(async (req, res) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$releaseYear",
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        priceTotal: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { minPrice: 1 } },
    //{ $match: {maxPrice: {$gte: 60}}}
  ]);

  res.status(200).json({
    status: "success",
    count: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMovieByGenre = asyncErrorHandler(async (req, res) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { genre: "$_id" } },
    { $project: { _id: 0 } },
    { $sort: { movieCount: -1 } },

    { $match: { genre: genre } },
  ]);

  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies,
    },
  });
});
exports.showform=async(req,res)=>{
  res.render('movie')
};
