# Vidly
a server side application, used to rent movies by users and customers.
To run the application:
- set up mongodb database and add it to the config default.json file.
- set the NODE_ENV=development
- set the vidly_jwtPrivateKey=1234
- run npm start

to run unit and integration tests:
- set NODE_ENV=test
- run npm test

to use application, make http request to the port:
- user must be logged in and authorised via jwt token to create or delete documents.
- user must be logged in to create rentals and returns.
