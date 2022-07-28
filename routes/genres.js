const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createGenre,
  getGenres,
  updateGenre,
  deleteGenre,
  getGenre,
  validateGenre,
} = require("../api/genresApi");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const genres = await getGenres();
  res.send(genres);
});

router.post("/", [auth, validate(validateGenre)], (req, res) => {
  createGenre(req.body.name).then((result) => {
    res.send(result);
  });
});

router.put("/:id", (req, res) => {
  updateGenre(req.params.id, req.body.name).then((genre) => {
    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    res.send(genre);
  });
});

router.delete("/:id", [auth, admin], (req, res) => {
  deleteGenre(req.params.id).then((genre) => {
    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");
    res.send(genre);
  });
});

router.get("/:id", validateObjectId, (req, res) => {
  getGenre(req.params.id).then((genre) => {
    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");
    res.send(genre);
  });
});

module.exports = router;
