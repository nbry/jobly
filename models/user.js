/** USER class for Jobly */

const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");

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
  static async authenticate(username, password) {
    try {
      // if username or password empty...
      if (!username || !password) {
        throw new ExpressError("Username and password required", 400);
      }

      // find user
      const results = await db.query(
        `SELECT username, password
        FROM users
        WHERE username = $1`,
        [username]
      );

      // authenticate and return boolean
      const user = results.rows[0];
      if (user) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({ username }, SECRET_KEY);
          return token;
        }
      }
    } catch (e) {
      throw new ExpressError(e.message, 500);
    }
  }

  static async getAll() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url, is_admin FROM users`
    );
    const users = results.rows.map((row) => {
      let u = new User(
        row.username,
        row.first_name,
        row.last_name,
        row.email,
        row.photo_url,
        row.is_admin
      );
      return {
        username: u.username,
        first_name: u.first_name,
        Last_name: u.last_name,
        email: u.email,
      };
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

  static async register(
    newUsername,
    newPassword,
    newFirstName,
    newLastName,
    newEmail,
    newPhotoUrl = "no image"
  ) {
    debugger;
    try {
      const hashedPass = await bcrypt.hash(newPassword, BCRYPT_WORK_FACTOR);
      const results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, password, first_name, last_name, photo_url, is_admin`,
        //   CHANGE THIS!!!
        [
          newUsername,
          hashedPass,
          newFirstName,
          newLastName,
          newEmail,
          newPhotoUrl,
        ]
      );
      debugger;
      const u = results.rows[0];
      const token = jwt.sign(
        { username: u.username, is_admin: u.is_admin },
        SECRET_KEY
      );
      return token;
    } catch (e) {
      User.parseSqlError(e);
    }
  }

  static parseSqlError(e) {
    if (e.code === "23505" && e.message.includes("pkey")) {
      throw new ExpressError("username already exists. Choose another", 400);
    } else if (e.code === "23505" && e.message.includes("email")) {
      throw new ExpressError("email already exists. Choose another", 400);
    } else {
      throw new ExpressError(e.message, 500);
    }
  }

  // INSTANCE METHODS
  async update(changesObj) {
    try {
      let username = this.username;
      delete changesObj._token;
      for (let item in changesObj) {
        if (item === "username") {
          username = changesObj[item];
        }
        let change = {};
        change[item] = changesObj[item];
        const c = sqlForPartialUpdate(
          "users",
          change,
          "username",
          this.username
        );

        await db.query(c.query, c.values);
      }
      const updatedUser = await User.getOne(username);
      return updatedUser;
    } catch (e) {
      User.parseSqlError(e);
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
