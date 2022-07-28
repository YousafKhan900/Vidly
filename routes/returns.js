const express = require("express");
const Joi = require("joi");
const { Movie } = require("../api/movieApi");
const { Rental } = require("../api/rentalsApi");
const auth = require("../middleware/auth");
const router = express.Router();
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturns)], async (req, res) => {
  const rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });

  if (!rental)
    return res.status(404).send("rental with customer/movie combination found");

  if (rental.dateReturned)
    return res.status(400).send("this rental has already been processed");

  rental.dateReturned = new Date();
  rental.rentalFee = rental.calculateDays() * rental.movie.dailyRentalRate;
  await rental.save();

  const movie = await Movie.findById(req.body.movieId);
  movie.numberInStock++;
  await movie.save();

  return res.status(200).send("valid request");
});

function validateReturns(req) {
  schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
