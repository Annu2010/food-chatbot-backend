import express from "express";
import bodyParser from "body-parser";
import { db } from "./database.js";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(bodyParser.json());

// -----------------------------
// New Order & Track Order Handler
// -----------------------------
app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  if (intent === "New Order") {
    const params = req.body.queryResult.parameters;

    const orderId = uuidv4().slice(0, 8); 
    const { food_item, quantity, address, phone } = params;

    db.run(
      "INSERT INTO orders (id, food_item, quantity, address, phone, status) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, food_item, quantity, address, phone, "Preparing"],
      (err) => {
        if (err) {
          return res.json({
            fulfillmentText:
              "Something went wrong while placing your order. Please try again."
          });
        }

        return res.json({
          fulfillmentText: `Your order has been placed! 🍔\nOrder ID: ${orderId}\nYou can track your order anytime by saying: Track order ${orderId}`
        });
      }
    );
  } else if (intent === "Track Order") {
    const orderId = req.body.queryResult.parameters.order_id;

    db.get(
      "SELECT * FROM orders WHERE id = ?",
      [orderId],
      (err, row) => {
        if (err || !row) {
          return res.json({
            fulfillmentText: "Sorry, I couldn't find any order with this ID."
          });
        }

        return res.json({
          fulfillmentText: `Your order status is: ${row.status}.\nFood: ${row.food_item}\nQuantity: ${row.quantity}`
        });
      }
    );
  } else {
    res.json({ fulfillmentText: "I didn't understand that." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
