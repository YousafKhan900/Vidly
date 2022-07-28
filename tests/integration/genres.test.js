const { default: mongoose } = require("mongoose");
const request = require("supertest");
const { Genre, createGenre } = require("../../api/genresApi");
const { createUser, User } = require("../../api/userApi");

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await Genre.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a 404 error if the given genre does not exist", async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });

    it("should return a a genre object with the given id", async () => {
      const genre = await createGenre("genre1");

      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.body._id).toBe(genre._id.toHexString());
      expect(res.body.name).toBe("genre1");
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set({ "x-auth-token": token })
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return a 401 error if the client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return a 400 error if length of genre name is < 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return a 400 error if length of genre name is > 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre document if its valid", async () => {
      const res = await exec();

      const genre = await Genre.find({ name });

      expect(genre).toBeTruthy();
    });

    it("should return the genre document if its valid", async () => {
      const res = await exec();

      const genre = await Genre.find({ name });

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let genre;
    let name;

    const exec = () => {
      return request(server)
        .put("/api/genres/" + genre._id)
        .send({ name });
    };

    beforeEach(async () => {
      genre = { _id: new mongoose.Types.ObjectId(), name: "genre1" };
      name = "genre2";

      await Genre.collection.insertOne(genre);
    });

    afterEach(async () => {
      await Genre.deleteMany();
    });

    it("should return the genre with the given id with the passed name", async () => {
      res = await exec();

      expect(res.body.name).toBe("genre2");
    });

    it("should update the genre with the given id with the passed name", async () => {
      res = await exec();

      genre = await Genre.findById(genre._id);

      expect(genre.name).toBe("genre2");
    });

    it("should return a 404 error if the given id does not exist", async () => {
      genre._id = new mongoose.Types.ObjectId();

      res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return a 400 error if the given genre name is shorter than 5", async () => {
      name = "1234";

      res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return a 400 error if the given genre name is greater than 5", async () => {
      name = Array(52).join("a");

      res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /:id", () => {
    let genre;
    let user;
    let token;

    beforeEach(async () => {
      genre = { _id: new mongoose.Types.ObjectId(), name: "genre1" };
      user = { _id: new mongoose.Types.ObjectId(), isAdmin: true };
      token = new User(user).generateAuthToken();

      await Genre.collection.insertOne(genre);
    });

    afterEach(async () => {
      Genre.deleteMany();
    });

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + genre._id)
        .set({ "x-auth-token": token });
    };

    it("should return 404 error if genre with given id is not found", async () => {
      genre._id = new mongoose.Types.ObjectId();

      res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 401 error if no token is provided", async () => {
      token = "";

      res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 error if user is not admin", async () => {
      user.isAdmin = false;
      token = new User(user).generateAuthToken();

      res = await exec();

      expect(res.status).toBe(403);
    });

    it("should delete the document with the given id from the database", async () => {
      res = await exec();

      genre = await Genre.findById(genre._id);

      expect(genre).toBeFalsy();
    });
  });
});
