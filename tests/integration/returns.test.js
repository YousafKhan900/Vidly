const { items } = require("joi/lib/types/array");
const { default: mongoose } = require("mongoose");
const { Rental } = require("../../api/rentalsApi");
const request = require("supertest");
const { User } = require("../../api/userApi");
const moment = require("moment");
const { Movie } = require("../../api/movieApi");

describe("/api/returns", () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let movie;
  let token;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set({ "x-auth-token": token })
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");

    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();

    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      numberInStock: 1,
      dailyRentalRate: 2,
      genre: {
        name: "12345",
      },
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Movie.remove({});
    await Rental.remove({});
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customer id is not provided", async () => {
    customerId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if movie id is not provided", async () => {
    movieId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for the customer/movie", async () => {
    await Rental.remove({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if the rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if it is a valid request", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should set the return date on the rental", async () => {
    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    const diff = new Date() - rentalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should calculate the rental fee", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    const numberOfDays = rentalInDb.calculateDays();

    expect(rentalInDb.rentalFee).toBeCloseTo(
      7 * rentalInDb.movie.dailyRentalRate
    );
  });

  it("should increase the movie stock", async () => {
    const stock = movie.numberInStock;

    const res = await exec();

    const movieInDb = await Movie.findById(movieId);

    expect(movieInDb.numberInStock).toBe(stock + 1);
  });
});
