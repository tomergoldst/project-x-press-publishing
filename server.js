const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors())
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(errorHandler());

app.use('/api', apiRouter);

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));

module.exports = app;
