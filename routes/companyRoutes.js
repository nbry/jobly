const express = require("express");
const router = new express.Router();
const Company = require("../models/company");
const General = require("../models/general");

router.get("/", async (req, res, next) => {
  try {
    let companies = await Company.getAll();
    if (req.query) {
      const q = req.query;
      if (q.search) {
        companies = General.searchParameter(companies, q.search);
      }
      if (q.min_employees) {
        companies = General.filterMin(
          companies,
          num_employees,
          q.min_employees
        );
      }
      if (q.max_employees) {
        companies = General.filterMax(
          companies,
          num_employees,
          q.max_employees
        );
      }
    }
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    General.validateJson(req.body, "companyPost");
    const { handle, name, num_employees, description, logo_url } = req.body;
    const company = await Company.create(
      handle,
      name,
      num_employees,
      description,
      logo_url
    );
    return res.status(201).json({ company });
  } catch (e) {
    return next(e);
  }
});

router.get("/:handle", async (req, res, next) => {
  try {
    const company = await Company.getOne(req.params.handle);
    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:handle", async (req, res, next) => {
  try {
    Company.validateJson(req.body, "patch");
    const company = await Company.getOne(req.params.handle);
    const updated = await company.update(req.body);
    return res.json({ company: updated });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:handle", async function (req, res, next) {
  try {
    let company = await Company.getOne(req.params.handle);
    await company.remove();
    return res.json({ message: "Company deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
