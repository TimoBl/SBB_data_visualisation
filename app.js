const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const public = path.join(__dirname, 'public')

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")))
  .get('/', (req, res) =>  res.sendFile(path.join(public, 'index.html')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));