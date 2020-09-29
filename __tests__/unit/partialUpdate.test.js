const sqlForPartialUpdate = require("../../helpers/partialUpdate");
let result;

beforeEach(() => {
  result = sqlForPartialUpdate("users", { name: "bob" }, "id", 1);
});

describe("partialUpdate()", () => {
  test("testing result of input query", () => {
    expect(result).toEqual({
      query: "UPDATE users SET name=$1 WHERE id=$2 RETURNING *",
      values: ["bob", 1],
    });
  });
  test("partial update query result object should have 2 keys", () => {
    expect(Object.keys(result).length).toEqual(2);
  });
});
