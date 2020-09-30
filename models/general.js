// const db = require("../db");
// const sqlForPartialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");

class General {
  // general function for "search" on a specified column query parameter on GET requests
  static searchParameter(arrayOfObjects, filterParam, searchString) {
    const search = arrayOfObjects.filter((i) => {
      return i[filterParam].toLowerCase().includes(searchString.toLowerCase());
    });
    return search;
  }

  // general function for "minimum" query parameter on GET requests
  static filterMin(arrayOfObjects, filterParam, minAmount) {
    return arrayOfObjects.filter(
      (i) => parseFloat(i[filterParam]) >= parseFloat(minAmount)
    );
  }

  // general function for "maximum" query parameter on GET requests
  static filterMax(arrayOfObjects, filterParam, maxAmount) {
    return arrayOfObjects.filter(
      (i) => parseFloat(i[filterParam]) <= parseFloat(maxAmount)
    );
  }

  // general function for validating input JSON for post and patch routes.
  // for this function to work, schema files MUST be in schema folder.
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
