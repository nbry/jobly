/** USER class for Jobly */

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");

class User {
  constructor(username, first_name, last_name, email, photo_url, is_admin) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
  }

  // STATIC METHODS
  static async getAll() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url, is_admin FROM users`
    );
    const users = results.rows.map((row) => {
      return new User(
        row.username,
        row.first_name,
        row.last_name,
        row.email,
        row.photo_url,
        row.is_admin
      );
    });
    return users;
  }

  static async getOne(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url, is_admin 
      FROM users
      WHERE username = $1`,
      [username]
    );
    if (results.rows.length > 0) {
      const j = results.rows[0];
      return new User(
        j.username,
        j.first_name,
        j.last_name,
        j.email,
        j.photo_url,
        j.is_admin
      );
    } else {
      throw new ExpressError(`No user with username ${username} found`, 404);
    }
  }

  static async create(
    newUsername,
    // CHANGE THIS!!!
    newPassword,
    newFirstName,
    newLastName,
    newPhotoUrl = "no image"
  ) {
    try {
      const results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING username, password, first_name, last_name, photo_url, is_admin`,
        //   CHANGE THIS!!!
        [newUsername, newPassword, newFirstName, newLastName, newPhotoUrl]
      );
      const {
        username,
        first_name,
        last_name,
        email,
        photo_url,
        is_admin,
      } = results.rows[0];

      return new User(
        username,
        first_name,
        last_name,
        email,
        photo_url,
        is_admin
      );
    } catch (e) {
      // CHANGE THIS:
      return e;
    }
  }

  //   static parseSqlError(e) {
  //     if (e.message.includes("equity")) {
  //       return new ExpressError(
  //         "equity must be a number between 0.0 and 1.0",
  //         400
  //       );
  //     } else if (e.message.includes("handle")) {
  //       return new ExpressError(`${e.message}`, 400);
  //     } else if (e.message.includes("salary")) {
  //       return new ExpressError("salary must be a positive number", 400);
  //     }
  //   }

  // INSTANCE METHODS
  async update(changesObj) {
    try {
      let username = this.username;
      for (let item in changesObj) {
        if (item === "username") {
          username = changesObj[item];
        }
        let change = {};
        change[item] = changesObj[item];
        const c = sqlForPartialUpdate(
          "jobs",
          change,
          "username",
          this.username
        );
        await db.query(c.query, c.values);
      }
      const updatedJob = await Job.getOne(username);
      return updatedJob;
    } catch (e) {
      // CHANGE THIS!!!!!
      return e;
    }
  }

  async remove() {
    await db.query(
      `DELETE FROM users
      WHERE username = $1`,
      [this.username]
    );
  }
}

module.exports = User;
