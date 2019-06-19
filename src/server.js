/* eslint-disable no-console */
/* eslint-env node */

const express = require('express')
const app = express()
const port = 8081
const opn = require('open')

app.get('/', (req, res) => {
  res.send({ msg: 'Welcome to launcher api server' })
})

app.post('/opn', async (req, res) => {
  const { target } = req.query
  if (target) {
    await opn(target)
  }
  // console.log('target:', target, req.query)
  res.send({ msg: 'Ok', query: req.query })
})

app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
)
