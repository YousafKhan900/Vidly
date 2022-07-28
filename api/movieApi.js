const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genresApi");

const movieSchema = mongoose.Schema({
  title: { type: String, required: true, minlength: 5, maxlength: 255 },
  numberInStock: { type: Number, required: true, min: 0, max: 225 },
  dailyRentalRate: { type: Number, required: true, min: 0, max: 225 },
  genre: {
    type: genreSchema,
    required: true,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

async function createMovie(title, numberInStock, dailyRentalRate, genre) {
  const movie = new Movie({
    title: title,
    numberInStock: numberInStock,
    dailyRentalRate: dailyRentalRate,
    genre: {
      name: genre.name,
      _id: genre._id,
    },
  });
  await movie.save();
  return movie;
}

async function getMovies() {
  const movies = await Movie.find();
  return movies;
}

async function getMovie(id) {
  const movie = await Movie.findById(id);
  return movie;
}

function validateMovie(movie) {
  const schema = {
    title: Joi.string().min(5).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  };

  return Joi.validate(movie, schema);
}

module.exports = { Movie, getMovie, createMovie, validateMovie, getMovies };
