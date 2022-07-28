const mongoose = require("mongoose");
const Joi = require("joi");

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

async function createGenre(name) {
  const genre = new Genre({
    name: name,
  });
  await genre.save();
  return genre;
}

async function getGenres() {
  const genres = await Genre.find().select({ _id: 1, name: 1 });
  return genres;
}

async function updateGenre(id, name) {
  const genre = await Genre.findById(id);
  if (!genre) return null;
  genre.name = name;
  const result = await genre.save();
  return result;
}

async function deleteGenre(id) {
  const genre = await Genre.findByIdAndDelete(id);
  return genre;
}

async function getGenre(id) {
  const genre = await Genre.findById(id);
  return genre;
}

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
  };

  return Joi.validate(genre, schema);
}

module.exports = {
  Genre,
  createGenre,
  getGenres,
  updateGenre,
  deleteGenre,
  getGenre,
  genreSchema,
  validateGenre,
};
