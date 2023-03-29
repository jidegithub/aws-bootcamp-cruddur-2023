require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const app = express();
const port = 3002;

app.use(morgan('dev'))

// Create the verifier outside your route handlers,
// so the cache is persisted and can be shared amongst them.
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_FzCLtlpCB",
  tokenUse: "access",
  clientId: "donfgu4tefui9tfb7nn2va1bv",
});

app.get("/", async (req, res, next) => {
  res.status(200).send(`<h1>Hello from jwt-authorizer</h1>`)
});

// health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send(`<h1>I am healthy! Thanks for checking in.</h1>`)
})

// verifier endpoint
console.log("start application")
app.get("/auth/*", async (req, res, next) => {
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
      console.log(`verifier app listening at http://localhost:${port}`);
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

module.exports = app;
