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
        jobs = General.filterMin(jobs, "salary", q.min_salary);
      }
      if (q.max_salary) {
        jobs = General.filterMax(jobs, "salary", q.max_salary);
      }
    }
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    General.validateJson(req.body, "jobPost");
    const { title, salary, equity, company_handle } = req.body;
    const job = await Job.create(title, salary, equity, company_handle);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
