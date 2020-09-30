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

CREATE TABLE users (
  username VARCHAR(15) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name VARCHAR(25) NOT NULL,
  last_name VARCHAR(25) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE
);