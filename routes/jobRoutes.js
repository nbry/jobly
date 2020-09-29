const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const db = require("../db");
const Company = require("../models/company");

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

module.exports = router;
