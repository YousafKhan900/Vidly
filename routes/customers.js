const express = require("express");
const router = express.Router();
const {
  getCustomers,
  createCustomer,
  validateCustomer,
  getCustomer,
} = require("../api/customerApi");
const validate = require("../middleware/validate");

router.get("/", (req, res) => {
  getCustomers().then((customers) => {
    res.send(customers);
  });
});

router.post("/", validate(validateCustomer), (req, res) => {
  createCustomer(req.body.name, req.body.phone, req.body.isGold).then(
    (customer) => {
      res.send(customer);
    }
  );
});

router.get("/:id", (req, res) => {
  getCustomer(req.params.id).then((customer) => {
    if (!customer)
      return res.status(404).send("The genre with the given ID was not found.");
    res.send(customer);
  });
});

module.exports = router;
