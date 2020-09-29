/** Comapnies class for Jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Company {
  constructor(handle, name, num_employees, description, logo_url) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

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

  static async create(
    newHandle,
    newName,
    newNumEmployees = 0,
    newDescription = "none",
    newLogoUrl = "no image"
  ) {
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
  }
}

module.exports = Company;
