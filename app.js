/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const { authenticateJWT } = require("./middleware/auth");
const app = express();

const aRoutes = require("./routes/authRoutes");
const cRoutes = require("./routes/companyRoutes");
const jRoutes = require("./routes/jobRoutes");
const uRoutes = require("./routes/userRoutes");

app.use(express.json());

// get auth token for all routes
app.use(authenticateJWT);

// add logging system
app.use(morgan("tiny"));

//routes
app.use("/", aRoutes);
app.use("/companies", cRoutes);
app.use("/jobs", jRoutes);
app.use("/users", uRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
