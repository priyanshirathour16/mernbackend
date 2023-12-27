const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  order_data: {
    type: Array,
    required: true,
  },
  order_id: {
    type: String,
  },
});

const order_modal = mongoose.model("order", OrderSchema);
module.exports = order_modal;
