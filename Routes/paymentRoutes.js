const router = require("express").Router();
const Razorpay = require("razorpay");
const Order = require("../modals/order");
const {
  validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");

const { RAZOR_PAY_API_KEY, RAZOR_PAY_API_SECRET } = process.env;

router.post("/checkout", async (req, res) => {
  const { amount } = req.body;
  let data = req.body.order_data;
  // console.log(data);
  await data.splice(
    0,
    0,
    { order_date: req.body.order_date },
    { order_time: req.body.order_time }
  );

  var instance = new Razorpay({
    key_id: RAZOR_PAY_API_KEY,
    key_secret: RAZOR_PAY_API_SECRET,
  });

  try {
    var options = {
      amount: amount * 100,
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    // console.log(order);

    let eid = await Order.findOne({ email: req.body.email });
    // console.log(eid);
    if (eid === null) {
      try {
        var validorder = await Order.create({
          email: req.body.email,
          order_data: [data],
          order_id: order.id,
        });
      } catch (err) {
        // console.log(err);
        res.send("server error", err.message);
      }
    } else {
      try {
        validorder = await Order.findOneAndUpdate(
          { email: req.body.email },
          { $push: { order_data: data } },
          { order_id: order.id }
        );
      } catch (err) {
        // console.log(err);
        res.status(400).send("server error", err.message);
      }
    }

    // console.log("order is ", validorder);

    res.status(200).json({ success: true, order, validorder });
  } catch (err) {
    console.log(err);
  }
});

router.post("/paymentVerification", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  console.log(razorpay_payment_id, razorpay_order_id, razorpay_signature);
  const isvalid = validatePaymentVerification(
    { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    RAZOR_PAY_API_SECRET
  );
  if (isvalid) {
    // await Order.findByIdAndUpdate(
    //   { _id: razorpay_order_id },
    //   { paymentStatus: true }
    // );
    res.redirect("/myOrderData");
  } else {
    res.redirect("/myOrderData");
  }
});

module.exports = router;
