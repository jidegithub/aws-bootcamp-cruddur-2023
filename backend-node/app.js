const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send(
    `<h1>Docker is fun!</h1>`
  )
})

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

const server = app.listen(8080, () => {
  console.log('App listening on port', server.address().port);
});