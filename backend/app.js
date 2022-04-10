const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config({ path: "./config.env" });

// connect to the database
const db = require("../backend/server/db/connect");

// connect routes
// const route = require('../route/routes.js');
app.use(require("./route/routes"));

app.use(multer().any()); // HERE


// connect to server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(" app listening on port " + PORT);
});
