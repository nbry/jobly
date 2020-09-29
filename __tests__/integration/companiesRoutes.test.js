process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companies");

let testCompany;

beforeEach(async () => {
  const results = await db.query(
    `INSERT INTO companies (handle, name, num_employees)
        VALUES ('tc', 'Test Company', 500)
        RETURNING *`
  );
  handle = results.rows[0].handle;
  testCompany = await Company.getOne(handle);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of 1 company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    const companies = res.body.companies;
    expect(companies.length).toBe(1);
  });
});

describe("GET /companies/:handle", () => {
  test("Get a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.handle}`);
    expect(res.statusCode).toBe(200);
    let company = testCompany;
    expect(res.body).toEqual({ company });
  });

  describe("POST /companies", () => {
    test("Creates a single company and puts default values", async () => {
      const res = await request(app).post("/companies").send({
        handle: "tc2",
        name: "Test Company 2",
        num_employees: 3,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        company: {
          handle: "tc2",
          name: "Test Company 2",
          num_employees: 3,
          description: "none",
          logo_url: "no image",
        },
      });
    });
  });

  describe("PATCH /companies", () => {
    test("Updates a single company", async () => {
      const res = await request(app)
        .patch(`/companies/${testCompany.handle}`)
        .send({
          name: "Test Company 2",
          num_employees: 3,
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        company: {
          handle: "tc",
          name: "Test Company 2",
          num_employees: 3,
          description: null,
          logo_url: null,
        },
      });
    });
  });
});
