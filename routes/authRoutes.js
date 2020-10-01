const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  res.send("welcome to jobly");
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const token = await User.authenticate(username, password);
    return res.json({ token });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
