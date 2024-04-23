const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");

const movieSchema = new mongoose.Schema(
  {
    userId:{
      type:String
    },
    name: {
      type: String,
      required: [true, "name is required field!"],
      unique: true,
      maxlength: [100, "Name field should be less than 100 characters"],
      minlength: [4, "Name should be at least 4 characters"],
    },
    description: String,
    duration: {
      type: Number,
      required: [true, "duration is required field!"],
    },
    ratings: {
      type: Number,
      min: [1, "ratings must be 1 or higher"],
      max: [10, "ratings cannot be greater than 10"],
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required field!"],
    },
    releaseDate: {
      type: Date, // Assuming releaseDate is a Date field
      required: [true, "Release date is required field!"],
    },
    genres: {
      type: String,
      enum: {
        values: ["Action", "Adventure", "Comedy"],
        message: "This genre does not exist",
      },
    },
    createdBy: {
      type: String,
      required: [true, "createdBy is required field!"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Define virtual field for durationInHours as before
movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

// Add pre and post hooks as before if needed

movieSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

movieSchema.pre("save", function (next) {
  (this.createdBy = "Adnan"), next();
});

movieSchema.post("save", function (doc, next) {
  const content = `A new movie document with name {$doc.name} is created by {$doc.createdBy}\n`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

movieSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.EndTime = Date.now();

  const content = `Query took ${
    this.EndTime - this.startTime
  } milliseconds to fetch the documents.`;

  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

movieSchema.pre("aggregate", function (next) {
  console.log(
    this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
  );
  next();
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
