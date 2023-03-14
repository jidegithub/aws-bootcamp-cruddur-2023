require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const app = express();

app.use(morgan('dev'))

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env['AWS_COGNITO_USER_POOL_ID'],
  tokenUse: "access",
  clientId: process.env['AWS_COGNITO_USER_POOL_CLIENT_ID'],
  scope: "read",
});

// health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send(`<h1>I am healthy! Thanks for checking in.</h1>`)
})

// verifier endpoint
app.get("/", async (req, res, next) => {
  try {
    // A valid JWT is expected in the HTTP header "authorization"
    const token = req.header("Authorization")
    await jwtVerifier.verify(token);
  } catch (err) {
    console.error(err);
    return res.status(403).json({ statusCode: 403, message: "Forbidden" });
  }
  res.json({ private: "only visible to users sending a valid JWT" });
});

// Hydrate the JWT verifier, then start express.
// Hydrating the verifier makes sure the JWKS is loaded into the JWT verifier,
// so it can verify JWTs immediately without any latency.
// (Alternatively, just start express, the JWKS will be downloaded when the first JWT is being verified then)
jwtVerifier
  .hydrate()
  .catch((err) => {
    console.error(`Failed to hydrate JWT verifier: ${err}`);
    process.exit(1);
  })
  .then(() =>
    app.listen(port, () => {
      console.log("Example app listening at http://localhost:8080");
    })
  );

app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    res
      .status(err.statusCode || err.status || 500)
      .send(err || {});
  } else {
    next();
  }
});