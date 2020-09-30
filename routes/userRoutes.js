const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const General = require("../models/general");

router.get("/", async (req, res, next) => {
  try {
    let users = await User.getAll();
    return res.json({ users });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    //   General.validateJson(req.body, "userPost");
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
    } = req.body;
    const user = await User.create(
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url
    );
    return res.status(201).json({ user });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
