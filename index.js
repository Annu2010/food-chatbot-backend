import express from "express";
import bodyParser from "body-parser";
import { db } from "./database.js";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  // ------------------------
  // NEW ORDER
  // ------------------------
  if (intent === "New Order") {
    const food = req.body.queryResult.parameters.food;
    const quantity = req.body.queryResult.parameters.number;
    const address = req.body.queryResult.parameters.address;
    const phone = req.body.queryResult.parameters.phone;

    const orderId = uuidv4(); // unique ID

    const query = `
      INSERT INTO orders (id, food_item, quantity, address, phone, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.run(query, [orderId, food, quantity, address, phone], (err) => {
      if (err) {
        return res.json({
          fulfillmentText: "Error placing order. Try again!"
        });
      }

      return res.json({
        fulfillmentText: `Your order has been placed!  
        Order ID: ${orderId}`
      });
    });
  }

  // ------------------------
  // TRACK ORDER
  // ------------------------
  else if (intent === "Track Order") {
    const orderId = req.body.queryResult.parameters.order_id;

    db.get("SELECT status FROM orders WHERE id = ?", [orderId], (err, row) => {
      if (err || !row) {
        return res.json({
          fulfillmentText: "No order found for this ID."
        });
      }

      return res.json({
        fulfillmentText: `Your order status is: ${row.status}`
      });
    });
  }

  else {
    return res.json({
      fulfillmentText: "Sorry, I didn't understand that."
    });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

