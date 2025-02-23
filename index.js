const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const router = require("./routes/scheduleRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "*",
  })
);

app.use("/", router);

app.get("/", (req, res) => {
  res.status(200).json({ info: "API is working" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Service is running" });
});


module.exports = app;
