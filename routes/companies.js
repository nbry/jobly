const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const db = require("../db");
const Company = require("../models/companies");

router.get("/", async (req, res, next) => {
  try {
    const companies = await Company.getAll();
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { handle, name, num_employees, description, logo_url } = req.body;
    console.log(req.body);
    const company = await Company.create(
      handle,
      name,
      num_employees,
      description,
      logo_url
    );
    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
