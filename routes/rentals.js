const {
  getRentals,
  createRental,
  validateRental,
} = require("../api/rentalsApi");
const express = require("express");
const { getCustomer } = require("../api/customerApi");
const { getMovie } = require("../api/movieApi");
const validate = require("../middleware/validate");
const router = express.Router();

router.get("/", (req, res) => {
  getRentals().then((rentals) => {
    res.send(rentals);
  });
});

router.post("/", validate(validateRental), async (req, res) => {
  const customer = await getCustomer(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer");

  const movie = await getMovie(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie");

  const rental = await createRental(customer, movie);
  if (rental == Error) return res.status(400).send(rental.message);

  res.send(rental);
});

module.exports = router;
