const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
