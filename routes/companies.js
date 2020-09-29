const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const db = require("../db");
const Company = require("../models/companies");

router.get("/", async (req, res, next) => {
  try {
    let companies = await Company.getAll();
    if (req.query) {
      const q = req.query;
      if (q.search) {
        companies = Company.searchParameter(companies, q.search);
      }
      if (q.min_employees) {
        companies = Company.filterMinEmp(companies, q.min_employees);
      }
      if (q.max_employees) {
        companies = Company.filterMaxEmp(companies, q.max_employees);
      }
    }
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

router.get("/:handle", async (req, res, next) => {
  try {
    const handle = req.params.handle;
    const company = await Company.getOne(handle);
    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
