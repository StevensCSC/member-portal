CREATE TABLE suggestions(
  suggestion_id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  link VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  suggester INTEGER NOT NULL
);

CREATE TABLE votes(
  suggestion_id SERIAL REFERENCES suggestions(suggestion_id),
  voter INTEGER,
  PRIMARY KEY (suggestion_id, voter)
);
