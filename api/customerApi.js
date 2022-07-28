const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 255 },
  phone: { type: String, required: true, minlength: 5, maxlength: 20 },
  isGold: { type: Boolean, defualt: false },
});

const Customer = mongoose.model("Customer", customerSchema);

async function getCustomers() {
  const customers = await Customer.find();
  return customers;
}

async function createCustomer(name, phone, isGold) {
  const customer = new Customer({
    name: name,
    phone: phone,
    isGold: isGold,
  });
  await customer.save();
  return customer;
}

async function getCustomer(id) {
  const customer = await Customer.findById(id);
  return customer;
}

function validateCustomer(customer) {
  const schema = {
    name: Joi.string().min(4).max(50).required(),
    phone: Joi.string().min(5).max(20).required(),
    isGold: Joi.boolean(),
  };

  return Joi.validate(customer, schema);
}

module.exports = {
  getCustomers,
  createCustomer,
  validateCustomer,
  getCustomer,
};
