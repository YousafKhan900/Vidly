const mongoose = require("mongoose");
const Fawn = require("fawn");
const Joi = require("joi");

Fawn.init("mongodb://localhost/vidly");

const rentalSchema = mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: { type: String, required: true, minlength: 2, maxlength: 255 },
      isGold: { type: Boolean, default: false },
      phone: { type: String, required: true, minlength: 5, maxlength: 20 },
    }),
    required: true,
  },
  movie: {
    type: new mongoose.Schema({
      title: { type: String, required: true, minlength: 5, maxlength: 255 },
      dailyRentalRate: { type: Number, required: true, min: 0, max: 255 },
    }),
    required: true,
  },
  dateOut: { type: Date, required: true, default: Date.now },
  dateReturned: { type: Date },
  rentalFee: { type: Number, min: 0 },
});

rentalSchema.methods.calculateDays = function () {
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const differenceMs = Math.abs(this.dateReturned - this.dateOut);
  const numberOfDays = differenceMs / ONE_DAY;

  return numberOfDays;
};

const Rental = mongoose.model("Rental", rentalSchema);

async function createRental(customer, movie) {
  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();

    return rental;
  } catch (error) {
    return new Error(error.message);
  }
}

async function getRentals() {
  const rentals = await Rental.find().sort("-dateOut");
  return rentals;
}

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };

  return Joi.validate(rental, schema);
}

module.exports = { Rental, createRental, getRentals, validateRental };
