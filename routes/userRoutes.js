const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const General = require("../models/general");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

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
    General.validateJson(req.body, "userPost");
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url,
    } = req.body;
    const token = await User.register(
      username,
      password,
      first_name,
      last_name,
      email,
      photo_url
    );

    return res.json({ token });
  } catch (e) {
    return next(e);
  }
});

router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.getOne(req.params.username);
    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:username", ensureCorrectUser, async (req, res, next) => {
  try {
    General.validateJson(req.body, "userPatch");
    const user = await User.getOne(req.params.username);
    const updated = await user.update(req.body);
    return res.json({ user: updated });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    let user = await User.getOne(req.params.id);
    await user.remove();
    return res.json({ message: "User deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
