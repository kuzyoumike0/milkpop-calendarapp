const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// API routes
let events = []
app.get('/api/events', (req, res) => {
  res.json(events)
})
app.post('/api/events', (req, res) => {
  events.push(req.body)
  res.json({status: 'ok'})
})

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))