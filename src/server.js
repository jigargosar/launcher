/* eslint-disable no-console */
/* eslint-env node */

const express = require('express')
const app = express()
const port = 8081
const opn = require('open')

app.get('/', (req, res) => {
  // res.json({ msg2: 'Hello World!' })
  res.send({ msg: 'Hello World!' })
  opn('http://gmail.com')
})

// app.get('/links', (req, res) => {
//   res.json({ msg2: 'Hello World!' })
//   // res.send({ msg: 'Hello World!' })
// })

app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
)
