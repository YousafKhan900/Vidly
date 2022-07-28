const express = require("express");
const { getGenre } = require("../api/genresApi");
const {
  validateMovie,
  createMovie,
  getMovie,
  getMovies,
} = require("../api/movieApi");
const router = express.Router();

router.get("/", (req, res) => {
  getMovies().then((movies) => {
    res.send(movies);
  });
});

router.post("/", async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await getGenre(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre");

  const movie = await createMovie(
    req.body.title,
    req.body.numberInStock,
    req.body.dailyRentalRate,
    genre
  );

  res.send(movie);
});

router.get("/:id", (req, res) => {
  getMovie(req.params.id).then((movie) => {
    if (!movie)
      return res.status(404).send("The movie with the given ID was not found.");
    res.send(movie);
  });
});

module.exports = router;
