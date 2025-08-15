const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const eventsRouter = require('./routes/events');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/events', eventsRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
