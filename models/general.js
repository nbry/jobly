const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const patchSchema = require("../schemas/companyPatch.json");
const postSchema = require("../schemas/companyPost.json");

class General {
  static searchParameter(arrayOfObjects, searchString) {
    const search = arrayOfObjects.filter((j) => {
      return j.name.toLowerCase().includes(searchString.toLowerCase());
    });
    return search;
  }

  static filterMin(arrayOfObjects, filterParam, minAmount) {
    return arrayOfObjects.filter((j) => j[filterParam] >= minAmount);
  }

  static filterMax(arrayOfObjects, filterParam, maxAmount) {
    return arrayOfObjects.filter((j) => j[filterParam] <= minAmount);
  }
}

module.exports = General;
