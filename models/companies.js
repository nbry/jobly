/** Comapnies class for Jobly */

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const patchSchema = require("../schemas/companyPatch.json");
const postSchema = require("../schemas/companyPost.json");

class Company {
  constructor(handle, name, num_employees, description, logo_url) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  // STATIC METHODS
  static async getAll() {
    const results = await db.query(`SELECT * FROM companies`);
    const companies = results.rows.map((row) => {
      return new Company(
        row.handle,
        row.name,
        row.num_employees,
        row.description,
        row.logo_url
      );
    });
    return companies;
  }

  static async getOne(handle) {
    const results = await db.query(
      `SELECT * FROM companies
      WHERE handle = $1`,
      [handle]
    );
    if (results.rows.length > 0) {
      const c = results.rows[0];
      return new Company(
        c.handle,
        c.name,
        c.num_employees,
        c.description,
        c.logo_url
      );
    } else {
      throw new ExpressError("No company found", 404);
    }
  }

  static validateJson(json, type) {
    let result;
    if (type === "post") {
      result = jsonschema.validate(json, postSchema);
    } else if (type === "patch") {
      result = jsonschema.validate(json, patchSchema);
    }
    if (!result.valid) {
      const listOfErrors = result.errors.map((e) => e.stack);
      throw new ExpressError(listOfErrors, 400);
    }
  }

  static async create(
    newHandle,
    newName,
    newNumEmployees = 0,
    newDescription = "none",
    newLogoUrl = "no image"
  ) {
    try {
      const results = await db.query(
        `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name`,
        [newHandle, newName, newNumEmployees, newDescription, newLogoUrl]
      );
      const {
        handle,
        name,
        num_employees,
        description,
        logo_url,
      } = results.rows[0];
      return new Company(handle, name, num_employees, description, logo_url);
    } catch (e) {
      if (e.code === "23505" && e.message.includes("pkey")) {
        return new ExpressError(
          "Company **handle** already exists. Choose another",
          400
        );
      } else if (e.code === "23505" && e.message.includes("name")) {
        return new ExpressError(
          "Company **name** already exists. Choose another",
          400
        );
      }
    }
  }

  static searchParameter(companies, searchString) {
    const search = companies.filter((c) => {
      debugger;
      return c.name.toLowerCase().includes(searchString.toLowerCase());
    });
    return search;
  }

  static filterMinEmp(companies, minEmp) {
    return companies.filter((c) => c.num_employees >= minEmp);
  }

  static filterMaxEmp(companies, maxEmp) {
    return companies.filter((c) => c.num_employees <= maxEmp);
  }

  // INSTANCE METHODS
  async update(changesObj) {
    let handle = this.handle;
    for (let item in changesObj) {
      if (item === "handle") {
        handle = changesObj[item];
      }
      let change = {};
      change[item] = changesObj[item];
      const c = sqlForPartialUpdate("companies", change, "handle", this.handle);
      await db.query(c.query, c.values);
    }
    return Company.getOne(handle);
  }

  async remove() {
    await db.query(
      `DELETE FROM companies
      WHERE handle = $1`,
      [this.handle]
    );
  }
}

module.exports = Company;
