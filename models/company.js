/** Company class for Jobly */

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Company {
  constructor(handle, name, num_employees, description, logo_url) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
    this.jobs = 0;
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
      `SELECT c.handle, c.name, c.num_employees, c.description, c.logo_url, j.id, j.title 
      FROM companies AS c
      LEFT JOIN jobs AS j
      ON c.handle = j.company_handle
      WHERE c.handle = $1`,
      [handle]
    );

    if (results.rows.length > 0) {
      const c = results.rows[0];
      const company = new Company(
        c.handle,
        c.name,
        c.num_employees,
        c.description,
        c.logo_url,
        c.title
      );
      let jobs = [];
      for (let row of results.rows) {
        jobs.push({ id: row.id, title: row.title });
      }
      company.jobs = jobs;
      return company;
    } else {
      throw new ExpressError(`No company found with handle of ${handle}`, 404);
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
      RETURNING handle, name, num_employees, description, logo_url`,
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
      return Company.parseSqlError(e);
    }
  }

  static parseSqlError(e) {
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
    } else {
      throw new ExpressError(e.message, 500);
    }
  }

  // INSTANCE METHODS
  async update(changesObj) {
    try {
      let handle = this.handle;
      delete changesObj._token;
      for (let item in changesObj) {
        if (item === "handle") {
          handle = changesObj[item];
        }
        let change = {};
        change[item] = changesObj[item];
        const c = sqlForPartialUpdate(
          "companies",
          change,
          "handle",
          this.handle
        );
        await db.query(c.query, c.values);
      }
      const updatedCompany = await Company.getOne(handle);
      return updatedCompany;
    } catch (e) {
      return Company.parseSqlError(e);
    }
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
