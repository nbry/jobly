const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    res.json("hey there!");
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
