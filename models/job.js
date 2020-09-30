/** Job class for Jobly */

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class Job {
  constructor(id, title, salary, equity, company_handle, date_posted) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  // STATIC METHODS
  static async getAll() {
    const results = await db.query(`SELECT * FROM jobs`);
    const jobs = results.rows.map((row) => {
      return new Job(
        row.id,
        row.title,
        row.salary,
        row.equity,
        row.company_handle,
        row.date_posted
      );
    });
    return jobs;
  }

  static async getOne(id) {
    const results = await db.query(
      `SELECT * FROM jobs
      WHERE id = $1`,
      [id]
    );
    if (results.rows.length > 0) {
      const j = results.rows[0];
      return new Job(
        j.id,
        j.title,
        j.salary,
        j.equity,
        j.company_handle,
        j.date_posted
      );
    } else {
      throw new ExpressError(`No job found with id of ${id}`, 404);
    }
  }

  static async create(newTitle, newSalary, newEquity, newCompany_handle) {
    try {
      const results = await db.query(
        `INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, salary, equity, company_handle, date_posted`,
        [newTitle, newSalary, newEquity, newCompany_handle]
      );
      const {
        id,
        title,
        salary,
        equity,
        company_handle,
        date_posted,
      } = results.rows[0];

      return new Job(id, title, salary, equity, company_handle, date_posted);
    } catch (e) {
      return Job.parseSqlError(e);
    }
  }

  static async jobQuerySearch(search) {
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle, date_posted
      FROM jobs
      WHERE title ILIKE '%'||$1||'%' OR company_handle ILIKE '%'||$1||'%'`,
      [search]
    );

    const jobs = results.rows.map((row) => {
      return new Job(
        row.id,
        row.title,
        row.salary,
        row.equity,
        row.company_handle,
        row.date_posted
      );
    });
    return jobs;
  }

  static parseSqlError(e) {
    if (e.message.includes("equity")) {
      return new ExpressError(
        "equity must be a number between 0.0 and 1.0",
        400
      );
    } else if (e.message.includes("handle")) {
      return new ExpressError(`${e.message}`, 400);
    } else if (e.message.includes("salary")) {
      return new ExpressError("salary must be a positive number", 400);
    }
  }

  // INSTANCE METHODS
  async update(changesObj) {
    try {
      for (let item in changesObj) {
        if (item === "id") {
          return new ExpressError("Not allowed to change id", 400);
        }
        let change = {};
        change[item] = changesObj[item];
        const j = sqlForPartialUpdate("jobs", change, "id", this.id);
        await db.query(j.query, j.values);
      }
      const updatedJob = await Job.getOne(this.id);
      return updatedJob;
    } catch (e) {
      return Job.parseSqlError(e);
    }
  }

  async remove() {
    await db.query(
      `DELETE FROM jobs
      WHERE id = $1`,
      [this.id]
    );
  }
}

module.exports = Job;
