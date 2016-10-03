# member-portal

A web app for members of SCSC to use for club-only things. It uses GitHub OAuth
for authentication, so only members of the StevensCSC organization can log in.

## Local Development Setup

### Postgres

1. Install Postgres.
2. Run `createdb scsc_db` to create the database.
3. Run `psql -f setup.sql scsc_db` script to initialize the database for local testing.

### Starting the App

`npm start` will build the client and server code, and start the server.

`npm build-server` transpiles the server code using babel.

`npm build-client` builds the client bundle with webpack.

`npm build` builds the server and client.

`npm serve` starts the server.

You should be able to reach the site at `localhost:3000`.
