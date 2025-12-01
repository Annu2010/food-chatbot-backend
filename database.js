import sqlite3 from "sqlite3";
sqlite3.verbose();

export const db = new sqlite3.Database("./orders.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, food_item TEXT, quantity INTEGER, address TEXT, phone TEXT, status TEXT)"
  );
});
