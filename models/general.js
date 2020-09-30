const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

class General {
  static searchParameter(arrayOfObjects, filterParam, searchString) {
    const search = arrayOfObjects.filter((j) => {
      return j[filterParam].toLowerCase().includes(searchString.toLowerCase());
    });
    return search;
  }

  static filterMin(arrayOfObjects, filterParam, minAmount) {
    return arrayOfObjects.filter((j) => j[filterParam] >= minAmount);
  }

  static filterMax(arrayOfObjects, filterParam, maxAmount) {
    return arrayOfObjects.filter((j) => j[filterParam] <= minAmount);
  }

  static validateJson(json, schema) {
    let result;
    let schemaDirectory = require(`../schemas/${schema}.json`);
    result = jsonschema.validate(json, schemaDirectory);
    if (!result.valid) {
      const listOfErrors = result.errors.map((e) => e.stack);
      throw new ExpressError(listOfErrors, 400);
    }
  }
}

module.exports = General;
