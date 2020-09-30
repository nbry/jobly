-- Make sure to seed into main and testing database
CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary NUMERIC NOT NULL CHECK(salary > 0),
  equity NUMERIC(2, 1) CHECK(
    equity >= 0
    AND equity <= 1
  ),
  company_handle TEXT REFERENCES companies(handle) ON DELETE CASCADE,
  date_posted DATE DEFAULT CURRENT_DATE
);