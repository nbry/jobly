const express = require("express");
const router = new express.Router();
const Job = require("../models/job");
const General = require("../models/general");

router.get("/", async (req, res, next) => {
  try {
    let jobs = await Job.getAll();
    if (req.query) {
      const q = req.query;
      if (q.search) {
        jobs = General.searchParameter(jobs, "title", q.search);
      }
      if (q.min_salary) {
        jobs = General.filterMinEmp(jobs, salary, q.min_salary);
      }
      if (q.max_salary) {
        jobs = General.filterMaxEmp(jobs, salary, q.max_salary);
      }
    }
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
